import React, { useState, useEffect } from 'react';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';
import { PlusCircle, Pencil, Trash2, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const StudentsView = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchCourse, setSearchCourse] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState(null);
    const [tableMessage, setTableMessage] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(() => {
        const saved = localStorage.getItem('students_recordsPerPage');
        return saved ? parseInt(saved, 10) : 10;
    });

    // Fetch students, optionally with filters
    const fetchStudents = async (filters = {}) => {
        try {
            let url = 'http://localhost/abbey_app/Abbey_backend/students.php?action=list';

            const { student_id, student_name, course_id } = filters;
            if (student_id || student_name || course_id) {
                const params = new URLSearchParams();
                params.append('action', 'search');
                if (student_id) params.append('student_id', student_id);
                if (student_name) params.append('student_name', student_name);
                if (course_id) params.append('course_id', course_id);
                url = `http://localhost/abbey_app/Abbey_backend/students.php?${params.toString()}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            setStudents(data);
        } catch (err) {
            console.error('Failed to fetch students', err);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await fetch('http://localhost/abbey_app/Abbey_backend/students.php?action=courses');
            const data = await res.json();
            setCourses(data);
        } catch (err) {
            console.error('Failed to fetch courses', err);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchStudents({
            student_id: searchId,
            student_name: searchName,
            course_id: searchCourse,
        });
    };

    const handleResetSearch = () => {
        setSearchId('');
        setSearchName('');
        setSearchCourse('');
        setCurrentPage(1);
        fetchStudents();
    };

    const handleAddStudent = async (student) => {
        try {
            const res = await fetch(
                'http://localhost/abbey_app/Abbey_backend/students.php?action=add',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(student),
                }
            );
            const data = await res.json();
            if (data.status === 'success') {
                fetchStudents();
                setTableMessage('✅ Student added successfully!');
                setShowAddModal(false);
            } else {
                setTableMessage(`❌ Error: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            setTableMessage('❌ Failed to add student. Please try again.');
        }
        setTimeout(() => setTableMessage(''), 3000);
    };

    const handleDeleteStudent = async (student_id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this student?');
        if (!confirmDelete) return;

        try {
            const res = await fetch(
                'http://localhost/abbey_app/Abbey_backend/students.php?action=delete',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ student_id }),
                }
            );
            const data = await res.json();
            if (data.status === 'success') {
                fetchStudents();
                setTableMessage('🗑️ Student deleted successfully!');
            } else {
                setTableMessage(`❌ Failed to delete student: ${data.message}`);
            }
        } catch (err) {
            console.error('Delete error:', err);
            setTableMessage('❌ Failed to delete student. Please try again.');
        }
        setTimeout(() => setTableMessage(''), 3000);
    };

    const handleEditStudent = (student) => {
        setStudentToEdit(student);
        setShowEditModal(true);
    };

    const handleUpdateStudent = async (updatedStudent) => {
        try {
            const res = await fetch(
                'http://localhost/abbey_app/Abbey_backend/students.php?action=update',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedStudent),
                }
            );
            const data = await res.json();
            if (data.status === 'success') {
                fetchStudents();
                setTableMessage('✏️ Student updated successfully!');
                setShowEditModal(false);
            } else {
                setTableMessage(`❌ Update failed: ${data.message}`);
            }
        } catch (err) {
            console.error('Update error:', err);
            setTableMessage('❌ Failed to update student. Try again.');
        }
        setTimeout(() => setTableMessage(''), 3000);
    };

    const downloadCSV = () => {
        if (!students.length) {
            alert('No student data to download.');
            return;
        }
        const headers = ['S.No', 'Student ID', 'Name', 'Course'];
        const rows = students.map((s, i) => [
            i + 1,
            s.student_id,
            `"${s.student_name}"`,
            `"${s.course_name}"`,
        ]);
        const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'students.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Pagination calculations
    const filtered = students; // no extra filtering in this code; if you had extra filters, apply them
    const totalRecords = filtered.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const idxLast = currentPage * recordsPerPage;
    const idxFirst = idxLast - recordsPerPage;
    const currentRecords = filtered.slice(idxFirst, idxLast);

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

    return (
        <div className="p-8 text-slate-100">
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-600"
                >
                    <PlusCircle size={20} />
                    <span className="ml-2">Add Student</span>
                </button>
                <button
                    onClick={downloadCSV}
                    className="flex items-center px-4 py-2 bg-blue-500 rounded-lg hover:bg-green-600 ml-4"
                >
                    <Download size={20} />
                    <span className="ml-2">Download CSV</span>
                </button>
            </div>

            {/* Search / Filters */}
            <div className="bg-slate-800 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Search by Student ID"
                    className="p-2 rounded bg-slate-900"
                />
                <input
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Search by Name"
                    className="p-2 rounded bg-slate-900"
                />
                <select
                    value={searchCourse}
                    onChange={(e) => setSearchCourse(e.target.value)}
                    className="p-2 rounded bg-slate-900"
                >
                    <option value="">All Courses</option>
                    {courses.map((c) => (
                        <option key={c.course_id} value={c.course_id}>
                            {c.course_name}
                        </option>
                    ))}
                </select>
                <div className="flex space-x-2">
                    <button
                        onClick={handleSearch}
                        className="flex-1 bg-emerald-500 rounded px-4 py-2 hover:bg-emerald-600"
                    >
                        Search
                    </button>
                    <button
                        onClick={handleResetSearch}
                        className="flex-1 bg-gray-600 rounded px-4 py-2 hover:bg-gray-500"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Rows-per-page selector & summary */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-400">
                    Showing {showFrom}–{showTo} of {totalRecords} records
                </div>
                <div>
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-wrap justify-end items-center mt-6 gap-4 py-3">
                            {/* First */}

                            {/* Prev */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-2 py-1 rounded ${currentPage === 1
                                    ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                    }`}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {/* Current Page */}
                            <span className="px-4 py-1 rounded bg-blue-600 text-white font-semibold">
                                Page {currentPage}
                            </span>
                            {/* Next */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-2 py-1 rounded ${currentPage === totalPages
                                    ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                    }`}
                            >
                                <ChevronRight size={18} />
                            </button>

                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <label htmlFor="rpp" className="text-sm text-gray-300">Rows per page:</label>
                    <select
                        id="rpp"
                        value={recordsPerPage}
                        onChange={handleRecordsPerPageChange}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-gray-300"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
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
                                <td colSpan="5" className="text-center py-3 bg-slate-700 text-emerald-400 font-semibold">
                                    {tableMessage}
                                </td>
                            </tr>
                        )}
                        {currentRecords.length > 0 ? (
                            currentRecords.map((s, idx) => (
                                <tr
                                    key={s.student_id ?? idx}
                                    className="border-t border-slate-700 hover:bg-slate-700 transition-colors"
                                >
                                    <td className="px-4 py-2">{idxFirst + idx + 1}</td>
                                    <td className="px-4 py-2">{s.student_id}</td>
                                    <td className="px-4 py-2">{s.student_name}</td>
                                    <td className="px-4 py-2">{s.course_name}</td>
                                    <td className="px-4 py-2 text-right space-x-2">
                                        <button
                                            onClick={() => handleEditStudent(s)}
                                            className="inline-flex items-center px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStudent(s.student_id)}
                                            className="inline-flex items-center px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-4">No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>



            {showAddModal && (
                <AddStudentModal
                    onClose={() => setShowAddModal(false)}
                    onAddStudent={handleAddStudent}
                />
            )}
            {showEditModal && (
                <EditStudentModal
                    onClose={() => setShowEditModal(false)}
                    onUpdateStudent={handleUpdateStudent}
                    student={studentToEdit}
                    courses={courses}
                />
            )}
        </div>
    );
};

export default StudentsView;
