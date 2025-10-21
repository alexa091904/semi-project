import React from 'react';
import axios from 'axios';
import '../../sass/layout.scss';

const Layout = ({ children, title = 'Dashboard', activePage = 'dashboard', showLogout = false, onLogout = null }) => {
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
        <div className="app-container">
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
                        <li className={activePage === 'dashboard' ? 'active' : ''}>
                            <a href="/dashboard">
                                <span>DASHBOARD</span>
                            </a>
                        </li>
                        <li className={activePage === 'profile' ? 'active' : ''}>
                            <a href="/profile">
                                <span>MY PROFILE</span>
                            </a>
                        </li>
                        <li className={activePage === 'students' ? 'active' : ''}>
                            <a href="/students">
                                <span>STUDENTS</span>
                            </a>
                        </li>
                        <li className={activePage === 'faculty' ? 'active' : ''}>
                            <a href="/faculty">
                                <span>FACULTY</span>
                            </a>
                        </li>
                        <li className={activePage === 'reports' ? 'active' : ''}>
                            <a href="/reports">
                                <span>REPORTS</span>
                            </a>
                        </li>
                        <li className={activePage === 'settings' ? 'active' : ''}>
                            <a href="/settings">
                                <span>SETTINGS</span>
                            </a>
                        </li>
                        <li className={activePage === 'archive' ? 'active' : ''}>
                            <a href="/archive">
                                <span>ARCHIVE</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {/* Top Bar */}
                <header className="top-bar">
                    <h1 className="page-title">{title}</h1>
                    {showLogout && (
                        <button className="logout-btn" onClick={onLogout || handleLogout}>
                            log out
                        </button>
                    )}
                </header>

                {/* Page Content */}
                <div className="page-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
