import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Layout from './Layout';
import '../../sass/students.scss';

// Initial form state
const INITIAL_FORM_STATE = {
    full_name: '',
    email_address: '',
    phone_number: '',
    sex: 'Male',
    date_of_birth: '',
    address: '',
    department_id: '',
    course_id: '',
    status: 'Active',
    academic_year_id: ''
};

const Students = () => {
    // State management
    const [state, setState] = useState({
        students: [],
        departments: [],
        courses: [],
        academicYears: [],
        loading: true,
        error: ''
    });

    const [modal, setModal] = useState({
        isOpen: false,
        editingStudent: null
    });

    const [filters, setFilters] = useState({
        search: '',
        department_id: '',
        course_id: '',
        academic_year_id: ''
    });

    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadStudents();
    }, [filters]);

    const loadData = useCallback(async () => {
        try {
            const endpoints = [
                '/api/students',
                '/api/departments',
                '/api/courses',
                '/api/academic-years'
            ];
            
            const responses = await Promise.all(endpoints.map(url => axios.get(url)));
            const [studentsData, deptsData, coursesData, yearsData] = responses.map(r => r.data);
            
            setState(prev => ({
                ...prev,
                students: studentsData,
                departments: deptsData,
                courses: coursesData,
                academicYears: yearsData,
                loading: false
            }));
        } catch (err) {
            console.error('Data loading error:', err);
            setState(prev => ({ ...prev, error: 'Failed to load data', loading: false }));
        }
    }, []);

    const loadStudents = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.set('search', filters.search);
            if (filters.department_id) params.set('department_id', filters.department_id);
            if (filters.course_id) params.set('course_id', filters.course_id);
            if (filters.academic_year_id) params.set('academic_year_id', filters.academic_year_id);

            const response = await axios.get(`/api/students?${params.toString()}`);
            setState(prev => ({ ...prev, students: response.data }));
        } catch (err) {
            console.error('Error loading students:', err);
        }
    };

    const openModal = useCallback((student = null) => {
        const formValues = student ? {
            ...INITIAL_FORM_STATE,
            full_name: student.full_name || '',
            email_address: student.email_address || '',
            phone_number: student.phone_number || '',
            sex: student.sex || 'Male',
            date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '',
            address: student.address || '',
            department_id: student.department_id || '',
            course_id: student.course_id || '',
            status: student.status || 'Active',
            academic_year_id: student.academic_year_id || ''
        } : INITIAL_FORM_STATE;

        setFormData(formValues);
        setModal({ isOpen: true, editingStudent: student });
        setState(prev => ({ ...prev, error: '' }));
    }, []);

    const closeModal = useCallback(() => {
        setModal({ isOpen: false, editingStudent: null });
        setFormData(INITIAL_FORM_STATE);
        setState(prev => ({ ...prev, error: '' }));
    }, []);

    const submitForm = useCallback(async (e) => {
        e.preventDefault();
        setState(prev => ({ ...prev, error: '' }));

        const endpoint = modal.editingStudent 
            ? `/api/students/${modal.editingStudent.student_id}`
            : '/api/students';
        const method = modal.editingStudent ? 'put' : 'post';

        try {
            await axios[method](endpoint, formData);
            closeModal();
            loadStudents();
        } catch (err) {
            console.error('Form submission error:', err);
            setState(prev => ({ 
                ...prev, 
                error: err.response?.data?.error || 'Failed to save student' 
            }));
        }
    }, [modal.editingStudent, formData, closeModal]);

    const archiveStudent = useCallback(async (id) => {
        const confirmed = window.confirm('Archive this student?');
        if (!confirmed) return;

        try {
            await axios.post(`/api/students/${id}/archive`);
            loadStudents();
        } catch (err) {
            console.error('Archive error:', err);
            alert('Failed to archive student');
        }
    }, []);

    if (state.loading) {
        return <div className="loading">Loading...</div>;
    }

    const { students, departments, courses, academicYears, error } = state;

    return (
        <Layout title="Students" activePage="students">
            <div className="students-content">
                <button className="btn-add-student" onClick={() => openModal()}>
                    Add New Students
                </button>

                {/* Filter Controls */}
                <div className="filters-row">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search here..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>
                    <select
                        value={filters.course_id}
                        onChange={(e) => setFilters(prev => ({ ...prev, course_id: e.target.value }))}
                    >
                        <option value="">All course</option>
                        {courses.map(course => (
                            <option key={course.course_id} value={course.course_id}>
                                {course.course_name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.department_id}
                        onChange={(e) => setFilters(prev => ({ ...prev, department_id: e.target.value }))}
                    >
                        <option value="">All department</option>
                        {departments.map(dept => (
                            <option key={dept.department_id} value={dept.department_id}>
                                {dept.department_name || dept.department_head}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.academic_year_id}
                        onChange={(e) => setFilters(prev => ({ ...prev, academic_year_id: e.target.value }))}
                    >
                        <option value="">Academic Year</option>
                        {academicYears.map(year => (
                            <option key={year.academic_year_id} value={year.academic_year_id}>
                                {year.start_date} - {year.end_date}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Data Table */}
                <div className="table-container">
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Full name</th>
                                <th>course</th>
                                <th>department</th>
                                <th>status</th>
                                <th>actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.student_id}>
                                    <td>{student.full_name}</td>
                                    <td>{student.course?.course_name || '-'}</td>
                                    <td>{student.department?.department_head || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${student.status.toLowerCase()}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-edit"
                                            onClick={() => openModal(student)}
                                        >
                                            edit
                                        </button>
                                        <button 
                                            className="btn-archive"
                                            onClick={() => archiveStudent(student.student_id)}
                                        >
                                            archive
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student Form Modal */}
            {modal.isOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={submitForm}>
                            <div className="form-grid">
                                <label>Department :</label>
                                <select
                                    value={formData.department_id}
                                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.department_id} value={dept.department_id}>
                                            {dept.department_head}
                                        </option>
                                    ))}
                                </select>

                                <label>Course :</label>
                                <select
                                    value={formData.course_id}
                                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(course => (
                                        <option key={course.course_id} value={course.course_id}>
                                            {course.course_name}
                                        </option>
                                    ))}
                                </select>

                                <label>Full name :</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                />

                                <label>Email Address :</label>
                                <input
                                    type="email"
                                    value={formData.email_address}
                                    onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                                    required
                                />

                                <label>phone number :</label>
                                <input
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    required
                                />

                                <label>Date of Birth :</label>
                                <input
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                    required
                                />

                                <label>addesss :</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                />

                                <label>sex :</label>
                                <select
                                    value={formData.sex}
                                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                                    required
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>

                                <label>status :</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    required
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Graduated">Graduated</option>
                                </select>

                                <label>school year :</label>
                                <select
                                    value={formData.academic_year_id}
                                    onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
                                >
                                    <option value="">Select Academic Year</option>
                                    {academicYears.map(year => (
                                        <option key={year.academic_year_id} value={year.academic_year_id}>
                                            {year.start_date} - {year.end_date}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-done">
                                    Done
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Students;
