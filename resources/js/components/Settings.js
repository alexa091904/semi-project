import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Layout from './Layout';
import '../../sass/settings.scss';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('courses');
    
    const [state, setState] = useState({
        courses: [],
        departments: [],
        academicYears: [],
        faculty: [],
        error: ''
    });

    const [modal, setModal] = useState({
        isOpen: false,
        isEditing: false,
        selectedItem: null
    });

    const [formData, setFormData] = useState({
        course_name: '',
        department_id: '',
        department_name: '',
        department_head: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        loadData();
    }, [activeTab, loadData]);

    const loadData = useCallback(async () => {
        try {
            if (activeTab === 'courses') {
                const [coursesRes, deptsRes] = await Promise.all([
                    axios.get('/api/courses'),
                    axios.get('/api/departments')
                ]);
                setState(prev => ({
                    ...prev,
                    courses: coursesRes.data,
                    departments: deptsRes.data
                }));
            } else if (activeTab === 'departments') {
                const [deptsRes, facultyRes] = await Promise.all([
                    axios.get('/api/departments'),
                    axios.get('/api/faculty')
                ]);
                setState(prev => ({
                    ...prev,
                    departments: deptsRes.data,
                    faculty: facultyRes.data
                }));
            } else if (activeTab === 'academic-years') {
                const res = await axios.get('/api/academic-years');
                setState(prev => ({ ...prev, academicYears: res.data }));
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setState(prev => ({ ...prev, error: 'Failed to load data' }));
        }
    }, [activeTab]);

    const openModal = useCallback((item = null) => {
        let formValues = {};
        
        if (activeTab === 'courses') {
            formValues = {
                course_name: item?.course_name || '',
                department_id: item?.department_id || ''
            };
        } else if (activeTab === 'departments') {
            formValues = {
                department_name: item?.department_name || '',
                department_head: item?.department_head || ''
            };
        } else if (activeTab === 'academic-years') {
            formValues = {
                start_date: item?.start_date || '',
                end_date: item?.end_date || ''
            };
        }
        
        setFormData(formValues);
        setModal({ isOpen: true, isEditing: !!item, selectedItem: item });
        setState(prev => ({ ...prev, error: '' }));
    }, [activeTab]);

    const closeModal = useCallback(() => {
        setModal({ isOpen: false, isEditing: false, selectedItem: null });
        setState(prev => ({ ...prev, error: '' }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setState(prev => ({ ...prev, error: '' }));

        try {
            if (activeTab === 'courses') {
                const payload = {
                    course_name: formData.course_name,
                    department_id: formData.department_id
                };
                
                if (modal.isEditing) {
                    await axios.put(`/api/courses/${modal.selectedItem.course_id}`, payload);
                } else {
                    await axios.post('/api/courses', payload);
                }
            } else if (activeTab === 'departments') {
                const payload = { 
                    department_name: formData.department_name,
                    department_head: formData.department_head 
                };
                
                if (modal.isEditing) {
                    await axios.put(`/api/departments/${modal.selectedItem.department_id}`, payload);
                } else {
                    await axios.post('/api/departments', payload);
                }
            } else if (activeTab === 'academic-years') {
                const payload = {
                    start_date: formData.start_date,
                    end_date: formData.end_date
                };
                
                if (modal.isEditing) {
                    await axios.put(`/api/academic-years/${modal.selectedItem.academic_year_id}`, payload);
                } else {
                    await axios.post('/api/academic-years', payload);
                }
            }

            closeModal();
            loadData();
        } catch (err) {
            console.error('Error saving:', err);
            setState(prev => ({ 
                ...prev, 
                error: err.response?.data?.error || 'Failed to save' 
            }));
        }
    };

    const handleArchive = async (id) => {
        if (!confirm('Are you sure you want to archive this item?')) return;

        try {
            const endpoint = activeTab === 'courses' ? `/api/courses/${id}/archive` :
                           activeTab === 'departments' ? `/api/departments/${id}/archive` :
                           `/api/academic-years/${id}/archive`;
            
            await axios.post(endpoint);
            loadData();
        } catch (err) {
            console.error('Error archiving:', err);
            alert('Failed to archive item');
        }
    };

    const { courses, departments, academicYears, error } = state;

    return (
        <Layout title="Settings" activePage="settings">
            <div className="settings-content">
                {/* Tabs */}
                <div className="settings-tabs">
                    <button
                        className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('courses')}
                    >
                        course
                    </button>
                    <button
                        className={`tab ${activeTab === 'academic-years' ? 'active' : ''}`}
                        onClick={() => setActiveTab('academic-years')}
                    >
                        academic year
                    </button>
                    <button
                        className={`tab ${activeTab === 'departments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('departments')}
                    >
                        department
                    </button>
                </div>

                {/* Add Button */}
                <div className="action-bar">
                    <button className="btn-add" onClick={() => openModal()}>
                        Add {activeTab === 'courses' ? 'course' :
                            activeTab === 'departments' ? 'department' :
                            'academic year'}
                    </button>
                </div>

                {/* Courses Table */}
                {activeTab === 'courses' && (
                    <div className="table-container">
                        <table className="settings-table">
                            <thead>
                                <tr>
                                    <th>course name</th>
                                    <th>department</th>
                                    <th>status</th>
                                    <th>actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map(course => (
                                    <tr key={course.course_id}>
                                        <td>{course.course_name}</td>
                                        <td>{course.department?.department_name || course.department?.department_head || '-'}</td>
                                        <td>
                                            <span className="status-badge active">Active</span>
                                        </td>
                                        <td>
                                            <button className="btn-action" onClick={() => openModal(course)}>
                                                edit
                                            </button>
                                            <button className="btn-action" onClick={() => handleArchive(course.course_id)}>
                                                archive
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Departments Table */}
                {activeTab === 'departments' && (
                    <div className="table-container">
                        <table className="settings-table">
                            <thead>
                                <tr>
                                    <th>department</th>
                                    <th>department head</th>
                                    <th>status</th>
                                    <th>actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map(dept => (
                                    <tr key={dept.department_id}>
                                        <td>{dept.department_name || '-'}</td>
                                        <td>{dept.department_head}</td>
                                        <td>
                                            <span className="status-badge active">Active</span>
                                        </td>
                                        <td>
                                            <button className="btn-action" onClick={() => openModal(dept)}>
                                                edit
                                            </button>
                                            <button className="btn-action" onClick={() => handleArchive(dept.department_id)}>
                                                archive
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Academic Years Table */}
                {activeTab === 'academic-years' && (
                    <div className="table-container">
                        <table className="settings-table">
                            <thead>
                                <tr>
                                    <th>school year</th>
                                    <th>status</th>
                                    <th>actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {academicYears.map(year => (
                                    <tr key={year.academic_year_id}>
                                        <td>{year.start_date} - {year.end_date}</td>
                                        <td>
                                            <span className="status-badge active">Active</span>
                                        </td>
                                        <td>
                                            <button className="btn-action" onClick={() => openModal(year)}>
                                                edit
                                            </button>
                                            <button className="btn-action" onClick={() => handleArchive(year.academic_year_id)}>
                                                archive
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {modal.isOpen && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <form onSubmit={handleSubmit}>
                                {activeTab === 'courses' && (
                                    <div className="form-grid">
                                        <label>course name</label>
                                        <input
                                            type="text"
                                            value={formData.course_name}
                                            onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                                            required
                                        />

                                        <label>department</label>
                                        <select
                                            value={formData.department_id}
                                            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept.department_id} value={dept.department_id}>
                                                    {dept.department_name || dept.department_head}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {activeTab === 'departments' && (
                                    <div className="form-grid">
                                        <label>department</label>
                                        <input
                                            type="text"
                                            value={formData.department_name || ''}
                                            onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                                            placeholder="e.g., BSIT"
                                            required
                                        />

                                        <label>department head</label>
                                        <select
                                            value={formData.department_head || ''}
                                            onChange={(e) => setFormData({ ...formData, department_head: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Department Head</option>
                                            <option value="-">- (No faculty assigned yet)</option>
                                            {state.faculty.map(f => (
                                                <option key={f.faculty_id} value={f.full_name}>
                                                    {f.full_name} - {f.position}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {activeTab === 'academic-years' && (
                                    <div className="form-grid">
                                        <label>school year</label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                type="number"
                                                placeholder="2022"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                min="2000"
                                                max="2100"
                                                required
                                                style={{ width: '100px' }}
                                            />
                                            <span>-</span>
                                            <input
                                                type="number"
                                                placeholder="2023"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                min="2000"
                                                max="2100"
                                                required
                                                style={{ width: '100px' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {error && <div className="error-message">{error}</div>}

                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={closeModal}>
                                        cancel
                                    </button>
                                    <button type="submit" className="btn-add-modal">
                                        add
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Settings;
