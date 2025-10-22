// EditStudentModal.js
import React, { useState, useEffect } from 'react';

const EditStudentModal = ({ onClose, onUpdateStudent, student, courses }) => {
    const [studentId, setStudentId] = useState(student.student_id);
    const [studentName, setStudentName] = useState(student.student_name);
    const [courseId, setCourseId] = useState(student.course_id);

    const handleUpdate = () => {
        if (!studentId || !studentName || !courseId) return alert("All fields are required");

        onUpdateStudent({
            id: student.id, // required for backend update
            student_id: studentId,
            student_name: studentName,
            course_id: parseInt(courseId)
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-white">Edit Student</h2>

                <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Student ID"
                    className="w-full mb-3 p-2 rounded bg-slate-900 text-white"
                />
                <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Student Name"
                    className="w-full mb-3 p-2 rounded bg-slate-900 text-white"
                />
                <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full mb-4 p-2 rounded bg-slate-900 text-white"
                >
                    <option value>Select Course</option>
                    {courses.map(c => (
                        <option key={c.course_id} value={c.course_id}>
                            {c.course_name}
                        </option>
                    ))}
                </select>

                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">
                        Cancel
                    </button>
                    <button onClick={handleUpdate} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white">
                        Update Student
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStudentModal;
