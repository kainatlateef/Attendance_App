import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Pencil, Trash2, Download } from 'lucide-react';
import { debounce } from 'lodash';
import AddCourseModal from './AddCourseModal';
import EditCourseModal from './EditCourseModal';

const CoursesView = () => {
    // 🔹 State Management
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState({ name: '', cricos: '' });
    const [message, setMessage] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // 🔹 API: Fetch Courses
    const fetchCourses = async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const res = await fetch(`/api/courses.php?action=view${params ? `&${params}` : ''}`);
            const data = await res.json();

            if (!Array.isArray(data)) throw new Error('Invalid data');
            setCourses(data);
        } catch (err) {
            console.error('❌ Fetch Error:', err);
            showTempMessage('❌ Failed to load courses.');
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // 🔹 Utility: Show message for 4 seconds
    const showTempMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 4000);
    };

    // 🔹 Debounced Search
    const debouncedSearch = useCallback(
        debounce((filters) => fetchCourses(filters), 500),
        []
    );

    const handleSearchChange = (field, value) => {
        const newSearch = { ...search, [field]: value };
        setSearch(newSearch);
        debouncedSearch({
            course_name: newSearch.name,
            course_cricos: newSearch.cricos,
        });
    };

    const handleResetSearch = () => {
        setSearch({ name: '', cricos: '' });
        fetchCourses();
    };

    // 🔹 Add Course
    const handleAddCourse = async (course) => {
        try {
            const res = await fetch('/api/courses.php?action=add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(course),
            });
            const data = await res.json();
            if (data.status === 'success') {
                fetchCourses();
                setShowAddModal(false);
                showTempMessage('✅ Course added successfully!');
            } else {
                showTempMessage(`❌ ${data.message}`);
            }
        } catch {
            showTempMessage('❌ Failed to add course.');
        }
    };

    // 🔹 Update Course
    const handleUpdateCourse = async (updatedCourse) => {
        try {
            const res = await fetch('/api/courses.php?action=update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCourse),
            });
            const data = await res.json();

            if (data.status === 'success') {
                fetchCourses();
                setShowEditModal(false);
                setSelectedCourse(null);
                showTempMessage('✅ Course updated successfully!');
            } else {
                showTempMessage(`❌ ${data.message}`);
            }
        } catch {
            showTempMessage('❌ Failed to update course.');
        }
    };

    // 🔹 Delete Course (with modal)
    const handleDeleteCourse = async () => {
        if (!selectedCourse) return;
        try {
            const res = await fetch('/api/courses.php?action=delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id: selectedCourse.course_id }),
            });
            const data = await res.json();

            if (data.status === 'success') {
                fetchCourses();
                showTempMessage('🗑️ Course deleted successfully!');
            } else {
                showTempMessage(`❌ ${data.message}`);
            }
        } catch {
            showTempMessage('❌ Failed to delete course.');
        } finally {
            setShowDeleteModal(false);
            setSelectedCourse(null);
        }
    };

    // 🔹 Download CSV
    const handleDownloadCSV = () => {
        if (!courses.length) return alert('No courses available to download.');

        const headers = ['Course ID', 'CRICOS Code', 'Course Name'];
        const rows = courses.map((c) => [c.course_id, c.course_cricos, c.course_name]);
        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'courses.csv';
        link.click();
    };

    return (
        <div className="p-8 text-slate-100">
            {/* Header Buttons */}
            <div className="flex justify-end mb-6 space-x-4">
                <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-600">
                    <PlusCircle size={20} /> <span className="ml-2">Add Course</span>
                </button>
                <button onClick={handleDownloadCSV} className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                    <Download size={20} /> <span className="ml-2">Download CSV</span>
                </button>
            </div>

            {/* Search Filters */}
            <div className="bg-slate-800 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    value={search.name}
                    onChange={(e) => handleSearchChange('name', e.target.value)}
                    placeholder="Search by Course Name"
                    className="p-2 rounded bg-slate-900 text-white"
                />
                <input
                    value={search.cricos}
                    onChange={(e) => handleSearchChange('cricos', e.target.value)}
                    placeholder="Search by CRICOS Code"
                    className="p-2 rounded bg-slate-900 text-white"
                />
                <div className="flex gap-2">
                    <button onClick={() => fetchCourses({
                        course_name: search.name,
                        course_cricos: search.cricos
                    })} className="w-1/2 bg-emerald-500 px-4 py-2 rounded hover:bg-emerald-600">
                        Search
                    </button>
                    <button onClick={handleResetSearch} className="w-1/2 bg-gray-600 px-4 py-2 rounded hover:bg-gray-700">
                        Reset
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-700 text-slate-300 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-4 py-2">#</th>
                            <th className="px-4 py-2">CRICOS Code</th>
                            <th className="px-4 py-2">Course Name</th>
                            <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {message && (
                            <tr>
                                <td colSpan="4" className="text-center py-3 bg-slate-700 text-emerald-400 font-semibold">
                                    {message}
                                </td>
                            </tr>
                        )}
                        {courses.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-6 text-gray-400">
                                    No courses found.
                                </td>
                            </tr>
                        ) : (
                            courses.map((course, i) => (
                                <tr key={course.course_id} className="border-t border-slate-700 hover:bg-slate-700 transition-colors">
                                    <td className="px-4 py-2">{i + 1}</td>
                                    <td className="px-4 py-2">{course.course_cricos}</td>
                                    <td className="px-4 py-2">{course.course_name}</td>
                                    <td className="px-4 py-2 text-right space-x-2">
                                        <button
                                            onClick={() => { setSelectedCourse(course); setShowEditModal(true); }}
                                            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedCourse(course); setShowDeleteModal(true); }}
                                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {showAddModal && <AddCourseModal onClose={() => setShowAddModal(false)} onAddCourse={handleAddCourse} />}
            {showEditModal && selectedCourse && (
                <EditCourseModal
                    course={selectedCourse}
                    onClose={() => setShowEditModal(false)}
                    onUpdateCourse={handleUpdateCourse}
                />
            )}

            {/* Delete Confirmation */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Confirm Deletion</h2>
                        <p className="text-sm text-gray-700 mb-6">
                            Deleting this course will also delete all students enrolled.
                            <br />
                            <strong className="text-red-600">Edit student courses first if needed.</strong>
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={handleDeleteCourse} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-white">
                                Delete Anyway
                            </button>
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-800">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoursesView;
