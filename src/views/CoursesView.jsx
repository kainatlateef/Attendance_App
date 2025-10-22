import React, { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, Download } from 'lucide-react';
import AddCourseModal from './AddCourseModal';         // ✅ Make sure this exists
import EditCourseModal from './EditCourseModal';       // ✅ Make sure this exists

const CoursesView = () => {
    const [courses, setCourses] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [searchCricos, setSearchCricos] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState(null);
    const [tableMessage, setTableMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const fetchCourses = async (filters = {}) => {
        try {
            let url = 'http://localhost/abbey_app/Abbey_backend/courses.php?action=view';
            const params = new URLSearchParams();

            if (filters.course_name) params.append('course_name', filters.course_name);
            if (filters.course_cricos) params.append('course_cricos', filters.course_cricos);

            if ([...params].length > 0) {
                url += '&' + params.toString();
            }

            const res = await fetch(url);
            const data = await res.json();
            setCourses(data);
        } catch (err) {
            console.error('Failed to fetch courses', err);
            setTableMessage('❌ Failed to load courses.');
            setTimeout(() => setTableMessage(''), 3000);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleSearch = () => {
        fetchCourses({
            course_name: searchName,
            course_cricos: searchCricos,
        });
    };

    const handleResetSearch = () => {
        setSearchName('');
        setSearchCricos('');
        fetchCourses();
    };

    const handleAddCourse = async (course) => {
        try {
            const res = await fetch('http://localhost/abbey_app/Abbey_backend/courses.php?action=add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(course),
            });
            const data = await res.json();

            if (data.status === 'success') {
                fetchCourses();
                setTableMessage('✅ Course added successfully!');
                setShowAddModal(false);
            } else {
                setTableMessage(`❌ Error: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            setTableMessage('❌ Failed to add course. Please try again.');
        } finally {
            setTimeout(() => setTableMessage(''), 4000);
        }
    };

    const handleEditClick = (course) => {
        setCourseToEdit(course);
        setShowEditModal(true);
    };
    const handleDeleteClick = (course_id) => {
        setCourseToDelete(course_id);
        setShowDeleteModal(true);
    };
    const handleConfirmDelete = async () => {
        try {
            const res = await fetch('http://localhost/abbey_app/Abbey_backend/courses.php?action=delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id: courseToDelete }),
            });

            const data = await res.json();

            if (data.status === 'success') {
                fetchCourses(); // reload course list
                setTableMessage('🗑️ Course deleted successfully!');
            } else {
                setTableMessage(`❌ Error: ${data.message}`);
            }
        } catch (err) {
            console.error('Delete error:', err);
            setTableMessage('❌ Failed to delete course. Please try again.');
        } finally {
            setTimeout(() => setTableMessage(''), 4000);
            setShowDeleteModal(false);
            setCourseToDelete(null);
        }
    };


    const handleUpdateCourse = async (updatedCourse) => {
        try {
            const res = await fetch('http://localhost/abbey_app/Abbey_backend/courses.php?action=update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCourse),
            });
            const data = await res.json();

            if (data.status === 'success') {
                fetchCourses();
                setTableMessage('✅ Course updated successfully!');
                setShowEditModal(false);
                setCourseToEdit(null);
            } else {
                setTableMessage(`❌ Error: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            setTableMessage('❌ Failed to update course. Please try again.');
        } finally {
            setTimeout(() => setTableMessage(''), 4000);
        }
    };

    const handleDeleteCourse = async (course_id) => {
        const confirmDelete = window.confirm('If you delete this course all students in this course will be deleted permanently, to avoid student deletion first Edit the  the student course.');
        if (!confirmDelete) return;

        try {
            const res = await fetch('http://localhost/abbey_app/Abbey_backend/courses.php?action=delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id }),
            });
            const data = await res.json();

            if (data.status === 'success') {
                fetchCourses();
                setTableMessage('🗑️ Course deleted successfully!');
            } else {
                setTableMessage(`❌ Error: ${data.message}`);
            }
        } catch (err) {
            console.error('Delete error:', err);
            setTableMessage('❌ Failed to delete course. Please try again.');
        } finally {
            setTimeout(() => setTableMessage(''), 4000);
        }
    };

    const downloadCSV = () => {
        if (!courses.length) {
            alert("No courses available to download.");
            return;
        }

        // Define CSV headers
        const headers = ["Course ID", "CRICOS Code", "Course Name"];

        // Map course data to rows
        const rows = courses.map(c => [
            c.course_id,
            c.course_cricos,
            c.course_name,
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(","),           // CSV Header row
            ...rows.map(r => r.join(",")) // CSV data rows
        ].join("\n");

        // Create a Blob from CSV string
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        // Create a download link and click it programmatically
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "courses.csv");
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-8 text-slate-100">
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-600"
                >
                    <PlusCircle size={20} />
                    <span className="ml-2">Add Course</span>
                </button>
                <button
                    onClick={downloadCSV}
                    className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 ml-4"
                >
                    <Download size={20} />
                    <span className="ml-2">Download CSV</span>
                </button>
            </div>

            {/* Search Filters */}
            <div className="bg-slate-800 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Search by Course Name"
                    className="p-2 rounded bg-slate-900 text-white"
                />
                <input
                    value={searchCricos}
                    onChange={(e) => setSearchCricos(e.target.value)}
                    placeholder="Search by CRICOS Code"
                    className="p-2 rounded bg-slate-900 text-white"
                />
                <div className="flex gap-2 w-full">
                    <div className="flex-1">
                        <button
                            onClick={handleSearch}
                            className="w-full bg-emerald-500 px-4 py-2 rounded hover:bg-emerald-600"
                        >
                            Search
                        </button>
                    </div>
                    <div className="flex-1">
                        <button
                            onClick={handleResetSearch}
                            className="w-full bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Reset
                        </button>
                    </div>
                </div>

            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-700 text-slate-300 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-4 py-2">C.NO</th>
                            <th className="px-4 py-2">CRICOS Code</th>
                            <th className="px-4 py-2">Course Name</th>
                            <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Message Row */}
                        {tableMessage && (
                            <tr>
                                <td colSpan="5" className="text-center py-3 bg-slate-700 text-emerald-400 font-semibold">
                                    {tableMessage}
                                </td>
                            </tr>
                        )}

                        {courses.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center py-6 text-gray-400">
                                    No courses found.
                                </td>
                            </tr>
                        ) : (
                            courses.map((course, index) => (
                                <tr
                                    key={course.course_id}
                                    className="border-t border-slate-700 hover:bg-slate-700 transition-colors"
                                >
                                    <td className="px-4 py-2">{index + 1}</td> {/* Row number */}
                                    <td className="px-4 py-2">{course.course_cricos}</td>
                                    <td className="px-4 py-2">{course.course_name}</td>
                                    <td className="px-4 py-2 text-right space-x-2">
                                        <button
                                            className="inline-flex items-center px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => handleEditClick(course)}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            className="inline-flex items-center px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => handleDeleteClick(course.course_id)}
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



            {/* Add Modal */}
            {
                showAddModal && (
                    <AddCourseModal
                        onClose={() => setShowAddModal(false)}
                        onAddCourse={handleAddCourse}
                    />
                )
            }

            {/* Edit Modal */}
            {
                showEditModal && courseToEdit && (
                    <EditCourseModal
                        course={courseToEdit}
                        onClose={() => {
                            setShowEditModal(false);
                            setCourseToEdit(null);
                        }}
                        onUpdateCourse={handleUpdateCourse}
                    />
                )
            }
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Confirm Deletion</h2>
                        <p className="text-sm text-gray-700 mb-6">
                            If you delete this course, all students in this course will be deleted permanently.
                            <br />
                            <strong className="text-red-600">To avoid student deletion, first edit the course in student records.</strong>
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-white"
                            >
                                Delete Anyway
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setCourseToDelete(null);
                                }}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-800"
                            >
                                Cancel
                            </button>

                        </div>
                    </div>
                </div>
            )}

        </div >
    );
};

export default CoursesView;
