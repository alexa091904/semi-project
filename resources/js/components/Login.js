import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import '../../sass/login.scss';

/**
 * Login Component
 * Authentication handler
 */
const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    }, [error]);

    const validateForm = useCallback(() => {
        if (!formData.username.trim()) {
            setError('Username is required');
            return false;
        }
        if (!formData.password.trim()) {
            setError('Password is required');
            return false;
        }
        return true;
    }, [formData]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/login', {
                username: formData.username.trim(),
                password: formData.password.trim()
            });

            if (response.data.success) {
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.response && error.response.data) {
                setError(error.response.data.message || 'Invalid username or password');
            } else {
                setError('An error occurred. Please try again.');
            }
            setFormData(prev => ({ ...prev, password: '' }));
        } finally {
            setLoading(false);
        }
    }, [formData, validateForm]);

    // Auto-hide error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <>
            {/* Header */}
            <header className="login-header">
                <div className="logo">
                    <div className="logo-icon">E</div>
                    <span>Edusync</span>
                </div>
                <button 
                    className="header-login-btn"
                    onClick={() => document.querySelector('.login-box')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    Log In
                </button>
            </header>

            {/* Main Content */}
            <main className="login-container">
                <div className="login-content">
                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <h1>Welcome to Edusync Management</h1>
                        <p>Manage your educational institution efficiently</p>
                    </div>

                    {/* Login Box */}
                    <div className="login-box">
                        <h2>log in</h2>
                        
                        {error && (
                            <div className="error-message" style={{ display: 'block' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="username">username</label>
                                <input 
                                    type="text" 
                                    id="username" 
                                    name="username" 
                                    placeholder="Enter your username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    autoComplete="username"
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="login-btn"
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Log in'}
                            </button>

                            <div className="forgot-password">
                                <a href="#">Forgot password?</a>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="login-footer">
                <p>This site is best viewed in Chrome or Firefox at a screen resolution of 1024 x 768</p>
                <p>Copyright © 2024 <span className="footer-logo">Edusync</span></p>
            </footer>
        </>
    );
};

export default Login;
