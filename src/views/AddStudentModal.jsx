// AddStudentModal.jsx
import React, { useState, useEffect } from 'react';

const AddStudentModal = ({ onClose, onAddStudent }) => {
    const [studentId, setStudentId] = useState('');
    const [studentName, setStudentName] = useState('');
    const [courseId, setCourseId] = useState('');
    const [courses, setCourses] = useState([]);

    // Fetch courses when modal opens
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('http://localhost/abbey_app/Abbey_backend/students.php?action=courses');
                const data = await res.json();
                setCourses(data);
            } catch (err) {
                console.error("Failed to fetch courses", err);
            }
        };
        fetchCourses();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!studentId || !studentName || !courseId) {
            return alert('All fields are required');
        }
        onAddStudent({ student_id: studentId, student_name: studentName, course_id: courseId });
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
            <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md text-white">
                <h3 className="text-xl mb-4">Add Student</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        placeholder="Student ID"
                        className="w-full p-2 rounded bg-slate-900"
                    />
                    <input
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        placeholder="Name"
                        className="w-full p-2 rounded bg-slate-900"
                    />
                    <select
                        value={courseId}
                        onChange={e => setCourseId(e.target.value)}
                        className="w-full p-2 rounded bg-slate-900"
                    >
                        <option value="">Select Course</option>
                        {courses.map(c => (
                            <option key={c.course_id} value={c.course_id}>
                                {c.course_name}
                            </option>
                        ))}
                    </select>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600"
                        >
                            Add Student
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudentModal;
