import React, { useState, useEffect, useCallback } from 'react';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';
import { PlusCircle, Pencil, Trash2, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { debounce } from 'lodash'; // optional, for debouncing search

// --- API helper functions ---
const api = {
    fetchStudents: async (filters = {}) => {
        const { student_id, student_name, course_id } = filters;
        let url = '/api/students.php?action=list';
        if (student_id || student_name || course_id) {
            const params = new URLSearchParams({ action: 'search' });
            if (student_id) params.append('student_id', student_id);
            if (student_name) params.append('student_name', student_name);
            if (course_id) params.append('course_id', course_id);
            url = `/api/students.php?${params.toString()}`;
        }
        const res = await fetch(url);
        return res.json();
    },
    fetchCourses: async () => {
        const res = await fetch('/api/students.php?action=courses');
        return res.json();
    },
    addStudent: async (student) => {
        const res = await fetch('/api/students.php?action=add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student),
        });
        return res.json();
    },
    updateStudent: async (student) => {
        const res = await fetch('/api/students.php?action=update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student),
        });
        return res.json();
    },
    deleteStudent: async (student_id) => {
        const res = await fetch('/api/students.php?action=delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id }),
        });
        return res.json();
    },
};

// --- Utility function for CSV download ---
const downloadCSV = (students) => {
    if (!students.length) return alert('No student data to download.');
    const headers = ['S.No', 'Student ID', 'Name', 'Course'];
    const rows = students.map((s, i) => [
        i + 1,
        s.student_id,
        `"${s.student_name}"`,
        `"${s.course_name}"`,
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const StudentsView = () => {
    // --- State ---
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filters, setFilters] = useState({ student_id: '', student_name: '', course_id: '' });
    const [tableMessage, setTableMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(() => {
        const saved = localStorage.getItem('students_recordsPerPage');
        return saved ? parseInt(saved, 10) : 10;
    });
    const [modal, setModal] = useState({ add: false, edit: false, student: null });

    // --- Fetch data ---
    const loadStudents = useCallback(async () => {
        try {
            const data = await api.fetchStudents(filters);
            setStudents(data);
        } catch (err) {
            console.error(err);
            setTableMessage('❌ Failed to fetch students.');
        }
    }, [filters]);

    const loadCourses = useCallback(async () => {
        try {
            const data = await api.fetchCourses();
            setCourses(data);
        } catch (err) {
            console.error(err);
            setTableMessage('❌ Failed to fetch courses.');
        }
    }, []);

    useEffect(() => {
        loadStudents();
        loadCourses();
    }, [loadStudents, loadCourses]);

    // --- Debounced search ---
    const debouncedSearch = useCallback(debounce(loadStudents, 500), [loadStudents]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setCurrentPage(1);
        debouncedSearch();
    };

    const handleResetFilters = () => {
        setFilters({ student_id: '', student_name: '', course_id: '' });
        setCurrentPage(1);
        loadStudents();
    };

    // --- CRUD handlers ---
    const handleAddStudent = async (student) => {
        try {
            const res = await api.addStudent(student);
            if (res.status === 'success') {
                setModal({ ...modal, add: false });
                setTableMessage('✅ Student added successfully!');
                loadStudents();
            } else {
                setTableMessage(`❌ ${res.message}`);
            }
        } catch (err) {
            console.error(err);
            setTableMessage('❌ Failed to add student.');
        }
        setTimeout(() => setTableMessage(''), 3000);
    };

    const handleEditStudent = (student) => setModal({ edit: true, student });

    const handleUpdateStudent = async (student) => {
        try {
            const res = await api.updateStudent(student);
            if (res.status === 'success') {
                setModal({ edit: false, student: null });
                setTableMessage('✏️ Student updated successfully!');
                loadStudents();
            } else {
                setTableMessage(`❌ ${res.message}`);
            }
        } catch (err) {
            console.error(err);
            setTableMessage('❌ Failed to update student.');
        }
        setTimeout(() => setTableMessage(''), 3000);
    };

    const handleDeleteStudent = async (student_id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            const res = await api.deleteStudent(student_id);
            if (res.status === 'success') {
                setTableMessage('🗑️ Student deleted successfully!');
                loadStudents();
            } else {
                setTableMessage(`❌ ${res.message}`);
            }
        } catch (err) {
            console.error(err);
            setTableMessage('❌ Failed to delete student.');
        }
        setTimeout(() => setTableMessage(''), 3000);
    };

    // --- Pagination ---
    const totalRecords = students.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const idxLast = currentPage * recordsPerPage;
    const idxFirst = idxLast - recordsPerPage;
    const currentRecords = students.slice(idxFirst, idxLast);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const handleRecordsPerPageChange = (e) => {
        const val = Number(e.target.value);
        setRecordsPerPage(val);
        localStorage.setItem('students_recordsPerPage', val);
        setCurrentPage(1);
    };

    const showFrom = idxFirst + 1;
    const showTo = Math.min(idxLast, totalRecords);

    // --- Render ---
    return (
        <div className="p-8 text-slate-100">
            {/* Actions */}
            <div className="flex justify-end mb-6 space-x-4">
                <button
                    onClick={() => setModal({ ...modal, add: true })}
                    className="flex items-center px-4 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-600"
                >
                    <PlusCircle size={20} /><span className="ml-2">Add Student</span>
                </button>
                <button
                    onClick={() => downloadCSV(students)}
                    className="flex items-center px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                    <Download size={20} /><span className="ml-2">Download CSV</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-slate-800 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                    value={filters.student_id}
                    onChange={e => handleFilterChange('student_id', e.target.value)}
                    placeholder="Search by Student ID"
                    className="p-2 rounded bg-slate-900"
                />
                <input
                    value={filters.student_name}
                    onChange={e => handleFilterChange('student_name', e.target.value)}
                    placeholder="Search by Name"
                    className="p-2 rounded bg-slate-900"
                />
                <select
                    value={filters.course_id}
                    onChange={e => handleFilterChange('course_id', e.target.value)}
                    className="p-2 rounded bg-slate-900"
                >
                    <option value="">All Courses</option>
                    {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                </select>
                <div className="flex space-x-2">
                    <button onClick={loadStudents} className="flex-1 bg-emerald-500 rounded px-4 py-2 hover:bg-emerald-600">Search</button>
                    <button onClick={handleResetFilters} className="flex-1 bg-gray-600 rounded px-4 py-2 hover:bg-gray-500">Reset</button>
                </div>
            </div>

            {/* Summary & Pagination */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-400">
                    Showing {showFrom}-{showTo} of {totalRecords} records
                </div>


                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-2 mt-4">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 rounded bg-slate-700 text-gray-300 hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-gray-500"
                        >
                            <ChevronsLeft size={16} />
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 rounded bg-slate-700 text-gray-300 hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-gray-500"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-4 py-1 rounded bg-blue-600 text-white font-semibold">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 rounded bg-slate-700 text-gray-300 hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-gray-500"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 rounded bg-slate-700 text-gray-300 hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-gray-500"
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <label htmlFor="rpp" className="text-sm text-gray-300">Rows per page:</label>
                    <select
                        id="rpp"
                        value={recordsPerPage}
                        onChange={handleRecordsPerPageChange}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-gray-300"
                    >
                        {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-700 text-slate-300 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-4 py-2">S.No</th>
                            <th className="px-4 py-2">Student ID</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Course</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableMessage && (
                            <tr>
                                <td colSpan="5" className="text-center py-3 bg-slate-700 text-emerald-400">{tableMessage}</td>
                            </tr>
                        )}
                        {currentRecords.length === 0 && !tableMessage && (
                            <tr>
                                <td colSpan="5" className="text-center py-3">No records found.</td>
                            </tr>
                        )}
                        {currentRecords.map((s, idx) => (
                            <tr key={s.student_id || idx} className="border-t border-slate-700 hover:bg-slate-700 transition-colors">
                                < td className="px-4 py-2" > {idxFirst + idx + 1}</td>
                                <td className="px-4 py-2">{s.student_id}</td>
                                <td className="px-4 py-2">{s.student_name}</td>
                                <td className="px-4 py-2">{s.course_name}</td>
                                <td className="px-4 py-2 flex gap-2">
                                    <button onClick={() => handleEditStudent(s)} className="p-1 bg-blue-500 rounded hover:bg-blue-600"><Pencil size={16} /></button>
                                    <button onClick={() => handleDeleteStudent(s.student_id)} className="p-1 bg-red-500 rounded hover:bg-red-600"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div >

            {/* Modals */}
            {modal.add && <AddStudentModal onAddStudent={handleAddStudent} onClose={() => setModal({ ...modal, add: false })} courses={courses} />}
            {modal.edit && <EditStudentModal student={modal.student} onUpdateStudent={handleUpdateStudent} onClose={() => setModal({ edit: false, student: null })} courses={courses} />}
        </div >
    );
};

export default StudentsView;
