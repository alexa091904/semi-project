import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Layout from './Layout';
import '../../sass/faculty.scss';

// Initial form state constant
const INITIAL_FORM_STATE = {
    full_name: '',
    email_address: '',
    phone_number: '',
    sex: 'Male',
    date_of_birth: '',
    address: '',
    department_id: '',
    position: 'Instructor',
    status: 'Active'
};

const Faculty = () => {
    // Grouped state
    const [state, setState] = useState({
        faculty: [],
        departments: [],
        loading: true,
        error: ''
    });

    const [modal, setModal] = useState({
        isOpen: false,
        editingFaculty: null
    });

    const [filters, setFilters] = useState({
        search: '',
        department_id: ''
    });

    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadFaculty();
    }, [filters]);

    const loadData = useCallback(async () => {
        try {
            const endpoints = ['/api/faculty', '/api/departments'];
            const responses = await Promise.all(endpoints.map(url => axios.get(url)));
            const [facultyData, deptsData] = responses.map(r => r.data);
            
            setState(prev => ({
                ...prev,
                faculty: facultyData,
                departments: deptsData,
                loading: false
            }));
        } catch (err) {
            console.error('Data loading error:', err);
            setState(prev => ({ ...prev, error: 'Failed to load data', loading: false }));
        }
    }, []);

    const loadFaculty = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.set('search', filters.search);
            if (filters.department_id) params.set('department_id', filters.department_id);

            const response = await axios.get(`/api/faculty?${params.toString()}`);
            setState(prev => ({ ...prev, faculty: response.data }));
        } catch (err) {
            console.error('Error loading faculty:', err);
        }
    };

    const openModal = useCallback((facultyMember = null) => {
        const formValues = facultyMember ? {
            ...INITIAL_FORM_STATE,
            full_name: facultyMember.full_name || '',
            email_address: facultyMember.email_address || '',
            phone_number: facultyMember.phone_number || '',
            sex: facultyMember.sex || 'Male',
            date_of_birth: facultyMember.date_of_birth ? new Date(facultyMember.date_of_birth).toISOString().split('T')[0] : '',
            address: facultyMember.address || '',
            department_id: facultyMember.department_id || '',
            position: facultyMember.position || 'Instructor',
            status: facultyMember.status || 'Active'
        } : INITIAL_FORM_STATE;

        setFormData(formValues);
        setModal({ isOpen: true, editingFaculty: facultyMember });
        setState(prev => ({ ...prev, error: '' }));
    }, []);

    const closeModal = useCallback(() => {
        setModal({ isOpen: false, editingFaculty: null });
        setFormData(INITIAL_FORM_STATE);
        setState(prev => ({ ...prev, error: '' }));
    }, []);

    const submitForm = useCallback(async (e) => {
        e.preventDefault();
        setState(prev => ({ ...prev, error: '' }));

        const endpoint = modal.editingFaculty 
            ? `/api/faculty/${modal.editingFaculty.faculty_id}`
            : '/api/faculty';
        const method = modal.editingFaculty ? 'put' : 'post';

        try {
            await axios[method](endpoint, formData);
            closeModal();
            loadFaculty();
        } catch (err) {
            console.error('Form submission error:', err);
            setState(prev => ({ 
                ...prev, 
                error: err.response?.data?.error || 'Failed to save faculty' 
            }));
        }
    }, [modal.editingFaculty, formData, closeModal]);

    const archiveFaculty = useCallback(async (id) => {
        const confirmed = window.confirm('Archive this faculty member?');
        if (!confirmed) return;

        try {
            await axios.post(`/api/faculty/${id}/archive`);
            loadFaculty();
        } catch (err) {
            console.error('Archive error:', err);
            alert('Failed to archive faculty');
        }
    }, []);

    if (state.loading) {
        return <div className="loading">Loading...</div>;
    }

    const { faculty, departments, error } = state;

    return (
        <Layout title="Faculty" activePage="faculty">
            <div className="faculty-content">
                <button className="btn-add-faculty" onClick={() => openModal()}>
                    Add New Faculty
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
                </div>

                {/* Faculty Table */}
                <div className="table-container">
                    <table className="faculty-table">
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
                            {faculty.map(member => (
                                <tr key={member.faculty_id}>
                                    <td>{member.full_name}</td>
                                    <td>{member.department?.department_head || '-'}</td>
                                    <td>{member.position}</td>
                                    <td>
                                        <span className={`status-badge ${member.status.toLowerCase()}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-edit"
                                            onClick={() => openModal(member)}
                                        >
                                            edit
                                        </button>
                                        <button 
                                            className="btn-archive"
                                            onClick={() => archiveFaculty(member.faculty_id)}
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

            {/* Faculty Form Modal */}
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

                                <label>Position :</label>
                                <input
                                    type="text"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    required
                                />

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

                                <label>address :</label>
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

export default Faculty;
