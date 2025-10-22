import React, { useState } from 'react';

const AddCourseModal = ({ onClose, onAddCourse }) => {
    const [courseName, setCourseName] = useState('');
    const [courseCricos, setCourseCricos] = useState('');

    const handleSubmit = () => {
        if (!courseName.trim() || !courseCricos.trim()) {
            alert('Please fill out all fields');
            return;
        }
        onAddCourse({ course_name: courseName, course_cricos: courseCricos });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg w-96">
                <h3 className="text-xl font-bold mb-4">Add New Course</h3>
                <input
                    type="text"
                    placeholder="Course Name"
                    value={courseName}
                    onChange={e => setCourseName(e.target.value)}
                    className="w-full mb-3 p-2 rounded bg-slate-900"
                />
                <input
                    type="text"
                    placeholder="CRICOS Code"
                    value={courseCricos}
                    onChange={e => setCourseCricos(e.target.value)}
                    className="w-full mb-4 p-2 rounded bg-slate-900"
                />
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-emerald-500 rounded hover:bg-emerald-600"
                    >
                        Add Course
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCourseModal;
