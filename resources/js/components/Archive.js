import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';
import '../../sass/settings.scss';

const Archive = () => {
    const [archivedItems, setArchivedItems] = useState([]);
    const [archiveType, setArchiveType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [archiveFilters, setArchiveFilters] = useState({
        department_id: '',
        course_id: '',
        academic_year_id: ''
    });

    useEffect(() => {
        loadFilterData();
    }, []);

    useEffect(() => {
        loadArchivedItems();
    }, [archiveType, searchQuery, archiveFilters]);

    const loadFilterData = async () => {
        try {
            const [deptsRes, coursesRes, yearsRes] = await Promise.all([
                axios.get('/api/departments'),
                axios.get('/api/courses'),
                axios.get('/api/academic-years')
            ]);
            setDepartments(deptsRes.data);
            setCourses(coursesRes.data);
            setAcademicYears(yearsRes.data);
        } catch (err) {
            console.error('Error loading filter data:', err);
        }
    };

    const loadArchivedItems = async () => {
        try {
            const params = new URLSearchParams();
            params.set('type', archiveType);
            if (searchQuery) params.set('search', searchQuery);
            if (archiveFilters.department_id) params.set('department_id', archiveFilters.department_id);
            if (archiveFilters.course_id) params.set('course_id', archiveFilters.course_id);
            if (archiveFilters.academic_year_id) params.set('academic_year_id', archiveFilters.academic_year_id);

            const res = await axios.get(`/api/archived?${params.toString()}`);
            setArchivedItems(res.data.items || []);
        } catch (err) {
            console.error('Error loading archived items:', err);
        }
    };

    const handleRestore = async (item) => {
        if (!confirm('Are you sure you want to restore this item?')) return;

        try {
            const typeMap = {
                course: 'courses',
                department: 'departments',
                academic_year: 'academic-years',
                student: 'students',
                faculty: 'faculty'
            };
            const apiType = typeMap[item._type];
            await axios.post(`/api/${apiType}/${item._id}/restore`);
            loadArchivedItems();
        } catch (err) {
            console.error('Error restoring:', err);
            alert('Failed to restore item');
        }
    };

    return (
        <Layout title="Archive" activePage="archive">
            <div className="settings-content">
                <div className="archive-filters">
                    <select
                        value={archiveType}
                        onChange={(e) => {
                            setArchiveType(e.target.value);
                            setArchiveFilters({ department_id: '', course_id: '', academic_year_id: '' });
                        }}
                        className="filter-select"
                    >
                        <option value="all">All</option>
                        <option value="students">Students</option>
                        <option value="faculty">Faculty</option>
                        <option value="courses">Courses</option>
                        <option value="departments">Departments</option>
                        <option value="academic_years">Academic Years</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Search here..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />

                    {(archiveType === 'students' || archiveType === 'faculty' || archiveType === 'courses' || archiveType === 'all') && (
                        <select
                            value={archiveFilters.department_id}
                            onChange={(e) => setArchiveFilters({ ...archiveFilters, department_id: e.target.value })}
                            className="filter-select"
                        >
                            <option value="">All department</option>
                            {departments.map(dept => (
                                <option key={dept.department_id} value={dept.department_id}>
                                    {dept.department_name || dept.department_head}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="table-container">
                    <table className="settings-table">
                        <thead>
                            <tr>
                                <th>Full name</th>
                                <th>department</th>
                                <th>position</th>
                                <th>status</th>
                                <th>actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {archivedItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                        No archived items found
                                    </td>
                                </tr>
                            ) : (
                                archivedItems.map((item, index) => (
                                    <tr key={`${item._type}-${item._id}-${index}`}>
                                        <td>{item._label}</td>
                                        <td>{item._department || '-'}</td>
                                        <td>{item._type}</td>
                                        <td>
                                            <span className="status-badge inactive">Archived</span>
                                        </td>
                                        <td>
                                            <button className="btn-action" onClick={() => handleRestore(item)}>
                                                view
                                            </button>
                                            <button className="btn-action" onClick={() => handleRestore(item)}>
                                                restore
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Archive;
