import './bootstrap';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import axios from 'axios';

// Import components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MyProfile from './components/MyProfile';
import Students from './components/Students';
import Faculty from './components/Faculty';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Archive from './components/Archive';

// Protected Route Component - checks authentication via session
function ProtectedRoute({ children }) {
    const [authorized, setAuthorized] = useState(null);

    useEffect(() => {
        axios
            .get('/api/auth/check')
            .then((response) => {
                if (response.data.authenticated) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                }
            })
            .catch(() => setAuthorized(false));
    }, []);

    if (authorized === null) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Loading...
            </div>
        );
    }

    if (!authorized) return <Navigate to="/login" replace />;
    return children;
}

// Main App Component with React Router
function App() {
    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />

                {/* Protected routes */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute>
                            <MyProfile />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/students" 
                    element={
                        <ProtectedRoute>
                            <Students />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/faculty" 
                    element={
                        <ProtectedRoute>
                            <Faculty />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/reports" 
                    element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/settings" 
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/archive" 
                    element={
                        <ProtectedRoute>
                            <Archive />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
}

// Initialize React App
const appRoot = document.getElementById('app');
if (appRoot) {
    const root = createRoot(appRoot);
    root.render(<App />);
}
