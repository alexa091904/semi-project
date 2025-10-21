import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';
import '../../sass/profile.scss';

/**
 * MyProfile Component
 * Display and edit admin profile
 */
const MyProfile = () => {
    const [profile, setProfile] = useState({
        user_id: '',
        username: '',
        firstname: 'Admin',
        lastname: 'User',
        created_at: '',
        updated_at: ''
    });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        username: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    // Load profile data
    const loadProfile = async () => {
        try {
            const response = await axios.get('/api/profile');
            if (response.data.success) {
                setProfile(response.data.data);
                setFormData({
                    firstname: response.data.data.firstname || '',
                    lastname: response.data.data.lastname || '',
                    username: response.data.data.username
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const response = await axios.put('/api/profile', {
                firstname: formData.firstname,
                lastname: formData.lastname,
                username: formData.username
            });
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setEditing(false);
                loadProfile();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            setMessage({ type: 'error', text: errorMessage });
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setEditing(false);
        setFormData({
            firstname: profile.firstname || '',
            lastname: profile.lastname || '',
            username: profile.username
        });
        setMessage({ type: '', text: '' });
    };

    // Handle logout
    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await axios.post('/api/logout');
                window.location.href = '/';
            } catch (error) {
                console.error('Logout error:', error);
                window.location.href = '/';
            }
        }
    };

    return (
        <div className="profile-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <span className="logo-icon">🎓</span>
                        <span className="logo-text">Edusync</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <a href="/dashboard">
                                <span>DASHBOARD</span>
                            </a>
                        </li>
                        <li className="active">
                            <a href="/profile">
                                <span>MY PROFILE</span>
                            </a>
                        </li>
                        <li>
                            <a href="/students">
                                <span>STUDENTS</span>
                            </a>
                        </li>
                        <li>
                            <a href="/faculty">
                                <span>FACULTY</span>
                            </a>
                        </li>
                        <li>
                            <a href="/reports">
                                <span>REPORTS</span>
                            </a>
                        </li>
                        <li>
                            <a href="/settings">
                                <span>Settings</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {/* Top Bar */}
                <header className="top-bar">
                    <h1 className="page-title">My Profile</h1>
                    <button className="logout-btn" onClick={handleLogout}>
                        log out
                    </button>
                </header>

                {/* Profile Content */}
                <div className="profile-content">
                    {loading ? (
                        <div className="loading">Loading profile...</div>
                    ) : (
                        <div className="profile-card">
                            {message.text && (
                                <div className={`message ${message.type}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="profile-form">
                                <div className="profile-avatar">
                                    <div className="avatar-circle"></div>
                                    <h3>User Profile</h3>
                                </div>
                                {editing ? (
                                    <div className="form-grid edit-mode">
                                        <div className="form-group">
                                            <label>firstname</label>
                                            <input
                                                type="text"
                                                name="firstname"
                                                value={formData.firstname}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>lastname</label>
                                            <input
                                                type="text"
                                                name="lastname"
                                                value={formData.lastname}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group full-width">
                                            <label>username</label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-grid view-mode">
                                        <div className="form-group">
                                            <label>firstname</label>
                                            <input
                                                type="text"
                                                value={formData.firstname}
                                                disabled
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>lastname</label>
                                            <input
                                                type="text"
                                                value={formData.lastname}
                                                disabled
                                            />
                                        </div>
                                        <div className="form-group full-width">
                                            <label>username</label>
                                            <input
                                                type="text"
                                                value={formData.username}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="form-actions">
                                    {!editing ? (
                                        <button
                                            type="button"
                                            className="btn-edit"
                                            onClick={() => setEditing(true)}
                                        >
                                            Edit
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className="btn-cancel"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn-done"
                                            >
                                                Done
                                            </button>
                                        </>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
