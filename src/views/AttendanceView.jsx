import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AttendanceView = () => {
    const [records, setRecords] = useState([]);
    const [courses, setCourses] = useState([]);

    const [filters, setFilters] = useState({
        studentId: '',
        studentName: '',
        courseId: '',
        date: '',
        day: '',
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(() => {
        const saved = localStorage.getItem('recordsPerPage');
        return saved ? parseInt(saved, 10) : 10;
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchCourses = useCallback(async () => {
        try {
            const res = await fetch(`/api/courses.php?action=view`);
            const data = await res.json();
            setCourses(data);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to fetch courses');
        }
    }, []);

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ action: 'list' });
            if (filters.studentId) params.append('student_id', filters.studentId);
            if (filters.studentName) params.append('student_name', filters.studentName);
            if (filters.courseId) params.append('course_id', filters.courseId);
            if (filters.date) params.append('date', filters.date);

            const res = await fetch(`/api/attendance.php?${params.toString()}`);
            const data = await res.json();
            const dataWithDay = data.map((r) => ({
                ...r,
                dayOfWeek: new Date(r.created_at).toLocaleDateString('en-US', { weekday: 'long' }),
            }));
            setRecords(dataWithDay);
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError('Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCourses();
        fetchAttendance();
    }, [fetchCourses, fetchAttendance]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleClear = () => {
        setFilters({ studentId: '', studentName: '', courseId: '', date: '', day: '' });
        setCurrentPage(1);
        fetchAttendance();
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchAttendance();
    };

    const handleRowsPerPageChange = (e) => {
        const value = Number(e.target.value);
        setRecordsPerPage(value);
        localStorage.setItem('recordsPerPage', value);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    const filteredRecords = useMemo(() => {
        return records.filter((r) => !filters.day || r.dayOfWeek === filters.day);
    }, [records, filters.day]);

    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

    const formatDate = (datetime) => new Date(datetime).toLocaleDateString();
    const formatTime = (datetime) => new Date(datetime).toLocaleTimeString();

    const handleDownloadCSV = () => {
        const headers = ['Student ID', 'Name', 'Course', 'Date', 'Time', 'Status'];
        const rows = filteredRecords.map((r) => [
            r.student_id,
            r.student_name,
            r.course_name,
            formatDate(r.created_at),
            formatTime(r.created_at),
            r.status,
        ]);

        const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

        const link = document.createElement('a');
        link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
        link.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const showFrom = indexOfFirstRecord + 1;
    const showTo = Math.min(indexOfLastRecord, filteredRecords.length);

    return (
        <div className="p-8 text-slate-100">
            {/* Download Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={handleDownloadCSV}
                    className="flex items-center px-4 py-2 bg-blue-500 rounded-lg hover:bg-green-600 ml-4"
                >
                    <Download size={20} />
                    <span className="ml-2">Download CSV</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-slate-800 rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Student ID"
                        value={filters.studentId}
                        onChange={(e) => handleFilterChange('studentId', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white placeholder:text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Student Name"
                        value={filters.studentName}
                        onChange={(e) => handleFilterChange('studentName', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white placeholder:text-gray-400"
                    />
                    <select
                        value={filters.courseId}
                        onChange={(e) => handleFilterChange('courseId', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-gray-400"
                    >
                        <option value="">All Courses</option>
                        {courses.map((course) => (
                            <option key={course.course_id} value={course.course_id}>
                                {course.course_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="relative w-full">
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                            className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-gray-200"
                        />
                        <div className="pointer-events-none absolute right-3 top-2.5">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <select
                        value={filters.day}
                        onChange={(e) => handleFilterChange('day', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-gray-400"
                    >
                        <option value="">Day</option>
                        {daysOfWeek.map((day) => (
                            <option key={day} value={day}>
                                {day}
                            </option>
                        ))}
                    </select>

                    <div className="flex justify-end gap-4 w-full">
                        <button
                            onClick={handleClear}
                            className="w-full px-4 py-2 rounded bg-slate-600 hover:bg-slate-700"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSearch}
                            className="w-full px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Pagination & Rows per page */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-400">
                    Showing {showFrom}–{showTo} of {filteredRecords.length} records
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
                    <label htmlFor="rowsPerPage" className="text-sm text-gray-300">
                        Rows per page:
                    </label>
                    <select
                        id="rowsPerPage"
                        value={recordsPerPage}
                        onChange={handleRowsPerPageChange}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-gray-300"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            {/* Attendance Table */}
            {loading ? (
                <div className="text-center py-6 text-gray-400">Loading...</div>
            ) : error ? (
                <div className="text-center py-6 text-red-500">{error}</div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-lg border border-slate-700">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-700 text-slate-300 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-4 py-3">S.NO</th>
                                    <th className="px-4 py-3">Student ID</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Course</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Time</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.length > 0 ? (
                                    currentRecords.map((rec, i) => (
                                        <tr
                                            key={i}
                                            className="border-t border-slate-700 hover:bg-slate-700 transition-colors"
                                        >
                                            <td className="px-4 py-2">{indexOfFirstRecord + i + 1}</td>
                                            <td className="px-4 py-2">{rec.student_id}</td>
                                            <td className="px-4 py-2">{rec.student_name}</td>
                                            <td className="px-4 py-2">{rec.course_name}</td>
                                            <td className="px-4 py-2">{formatDate(rec.created_at)}</td>
                                            <td className="px-4 py-2">{formatTime(rec.created_at)}</td>
                                            <td className="px-4 py-2 font-bold text-emerald-400">{rec.status}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-6 text-gray-400">
                                            No attendance records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </>
            )}
        </div>
    );
};

export default AttendanceView;
