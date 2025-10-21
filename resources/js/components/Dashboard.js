import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../../sass/dashboard.scss';

/**
 * Dashboard Component
 * Edusync Management System
 */
const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        studentsPerCourse: [],
        facultyPerDepartment: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard/stats');
            const result = await response.json();
            
            if (result.success) {
                setStats(result.data);
            } else {
                setError('Failed to load dashboard statistics');
            }
        } catch (err) {
            setError('Error fetching dashboard data: ' + err.message);
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#4A90E2', '#7B68A6', '#C44E9C', '#50C8E8', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C'];

    if (loading) {
        return (
            <Layout title="DASHBOARD" activePage="dashboard">
                <div className="dashboard-content">
                    <div className="loading-spinner">Loading dashboard...</div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="DASHBOARD" activePage="dashboard">
                <div className="dashboard-content">
                    <div className="error-message">{error}</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="DASHBOARD" activePage="dashboard">
            <div className="dashboard-content">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1>WELCOME!</h1>
                </div>

                {/* Statistics Cards */}
                <div className="stats-cards">
                    <div className="stat-card">
                        <div className="stat-icon students-icon">
                            <i className="fas fa-user-graduate"></i>
                        </div>
                        <div className="stat-info">
                            <h3>Total Students</h3>
                            <p className="stat-number">{stats.totalStudents}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon faculty-icon">
                            <i className="fas fa-chalkboard-teacher"></i>
                        </div>
                        <div className="stat-info">
                            <h3>Total Faculty</h3>
                            <p className="stat-number">{stats.totalFaculty}</p>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="charts-section">
                    {/* Students Per Course Chart */}
                    <div className="chart-container">
                        <h2 className="chart-title">Students Per Course</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.studentsPerCourse}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="course" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="students" fill="#4A90E2" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Faculty Per Department Chart */}
                    <div className="chart-container">
                        <h2 className="chart-title">Faculty Per Department</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.facultyPerDepartment}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {stats.facultyPerDepartment.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
