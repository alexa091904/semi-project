import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';
import '../../sass/reports.scss';

const Reports = () => {
    const [reportType, setReportType] = useState('Students');
    const [filters, setFilters] = useState({
        course_id: '',
        department_id: '',
        search: ''
    });
    const [options, setOptions] = useState({
        courses: [],
        departments: []
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        try {
            const response = await axios.get('/api/reports');
            setOptions(response.data);
        } catch (err) {
            console.error('Error loading options:', err);
        }
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        setReportData(null);

        try {
            const endpoint = reportType === 'Students' 
                ? '/api/reports/students' 
                : '/api/reports/faculty';

            const payload = {};
            if (reportType === 'Students' && filters.course_id) {
                payload.course_id = filters.course_id;
            }
            if (filters.department_id) {
                payload.department_id = filters.department_id;
            }

            const response = await axios.post(endpoint, payload);
            setReportData(response.data);
        } catch (err) {
            console.error('Error generating report:', err);
            alert('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const filteredData = reportData?.data?.filter(item => {
        if (!filters.search) return true;
        const searchLower = filters.search.toLowerCase();
        return item.full_name?.toLowerCase().includes(searchLower) ||
               item.email_address?.toLowerCase().includes(searchLower);
    });

    return (
        <Layout title="Report" activePage="reports">
            <div className="reports-content">
                {/* Report Type Tabs */}
                <div className="report-tabs">
                    <button 
                        className={`tab ${reportType === 'Students' ? 'active' : ''}`}
                        onClick={() => {
                            setReportType('Students');
                            setReportData(null);
                            setFilters({ course_id: '', department_id: '', search: '' });
                        }}
                    >
                        Students
                    </button>
                    <button 
                        className={`tab ${reportType === 'Faculty' ? 'active' : ''}`}
                        onClick={() => {
                            setReportType('Faculty');
                            setReportData(null);
                            setFilters({ course_id: '', department_id: '', search: '' });
                        }}
                    >
                        Faculty
                    </button>
                </div>

                {/* Filters and Generate Button */}
                <div className="filters-section">
                    <div className="filters-row">
                        <input
                            type="text"
                            placeholder="Search here..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="search-input"
                        />

                        {reportType === 'Students' && (
                            <select
                                value={filters.course_id}
                                onChange={(e) => setFilters({ ...filters, course_id: e.target.value })}
                                className="filter-select"
                            >
                                <option value="">All courses</option>
                                {options.courses.map(course => (
                                    <option key={course.course_id} value={course.course_id}>
                                        {course.course_name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <select
                            value={filters.department_id}
                            onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
                            className="filter-select"
                        >
                            <option value="">All department</option>
                            {options.departments.map(dept => (
                                <option key={dept.department_id} value={dept.department_id}>
                                    {dept.department_name || dept.department_head}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        className="btn-generate"
                        onClick={handleGenerateReport}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate'}
                    </button>
                </div>

                {/* Report Table */}
                {reportData && (
                    <div className="report-table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Full name</th>
                                    {reportType === 'Students' ? (
                                        <>
                                            <th>course</th>
                                            <th>department</th>
                                            <th>grade level</th>
                                            <th>status</th>
                                        </>
                                    ) : (
                                        <>
                                            <th>department</th>
                                            <th>position</th>
                                            <th>status</th>
                                        </>
                                    )}
                                    <th>actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData && filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr key={reportType === 'Students' ? item.student_id : item.faculty_id}>
                                            <td>{item.full_name}</td>
                                            {reportType === 'Students' ? (
                                                <>
                                                    <td>{item.course?.course_name || '-'}</td>
                                                    <td>{item.department?.department_name || item.department?.department_head || '-'}</td>
                                                    <td>{item.grade_level || '-'}</td>
                                                    <td>
                                                        <span className={`status-badge ${item.status?.toLowerCase()}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{item.department?.department_name || item.department?.department_head || '-'}</td>
                                                    <td>{item.position || '-'}</td>
                                                    <td>
                                                        <span className={`status-badge ${item.status?.toLowerCase()}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            <td>
                                                <button className="btn-action">edit</button>
                                                <button className="btn-action">archive</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={reportType === 'Students' ? 6 : 5} style={{ textAlign: 'center' }}>
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!reportData && !loading && (
                    <div className="no-report">
                        <p>Select filters and click Generate to view report</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Reports;
