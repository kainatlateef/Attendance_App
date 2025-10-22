import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, CalendarCheck } from 'lucide-react';

const DashboardView = () => {
    const [totals, setTotals] = useState({
        totalStudents: 0,
        totalCourses: 0,
        todayAttendance: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboard = async () => {
        try {
            const res = await fetch('http://localhost/abbey_app/Abbey_backend/dashboard.php?action=totals');
            const json = await res.json();
            if (json.status === 'success') {
                setTotals(json.data);
            } else {
                setError(json.message || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            console.error('Dashboard fetch error', err);
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return <div className="p-10 text-slate-300 text-xl font-semibold animate-pulse">Loading dashboard...</div>;
    }
    if (error) {
        return <div className="p-10 text-red-500 text-xl font-semibold">Error: {error}</div>;
    }

    const { totalStudents, totalCourses, todayAttendance } = totals;

    return (
        <div className="p-8 md:p-12 lg:p-16">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {/* Total Students Card */}
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 transform transition duration-300 hover:scale-105 hover:shadow-slate-700/50">
                    <div className="flex flex-col items-start space-y-4">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-full p-4 shadow-lg">
                            <Users size={32} />
                        </div>
                        <div className="mt-4">
                            <p className="text-md md:text-lg font-medium text-gray-400 uppercase tracking-wide">Total Students</p>
                            <p className="text-4xl md:text-5xl font-bold text-slate-50 mt-1">{totalStudents}</p>
                        </div>
                    </div>
                </div>

                {/* Total Courses Card */}
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 transform transition duration-300 hover:scale-105 hover:shadow-slate-700/50">
                    <div className="flex flex-col items-start space-y-4">
                        <div className="bg-gradient-to-r from-cyan-600 to-blue-500 text-white rounded-full p-4 shadow-lg">
                            <ClipboardList size={32} />
                        </div>
                        <div className="mt-4">
                            <p className="text-md md:text-lg font-medium text-gray-400 uppercase tracking-wide">Total Courses</p>
                            <p className="text-4xl md:text-5xl font-bold text-slate-50 mt-1">{totalCourses}</p>
                        </div>
                    </div>
                </div>

                {/* Today's Attendance Card */}
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 transform transition duration-300 hover:scale-105 hover:shadow-slate-700/50">
                    <div className="flex flex-col items-start space-y-4">
                        <div className="bg-gradient-to-r from-lime-600 to-green-500 text-white rounded-full p-4 shadow-lg">
                            <CalendarCheck size={32} />
                        </div>
                        <div className="mt-4">
                            <p className="text-md md:text-lg font-medium text-gray-400 uppercase tracking-wide">Today's Attendance</p>
                            <p className="text-4xl md:text-5xl font-bold text-slate-50 mt-1">{todayAttendance}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;