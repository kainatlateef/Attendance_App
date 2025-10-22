import React, { useState, useEffect } from 'react';
import { Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const AttendanceView = () => {
    const [records, setRecords] = useState([]);
    const [courses, setCourses] = useState([]);

    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchCourse, setSearchCourse] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [searchDay, setSearchDay] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(() => {
        const saved = localStorage.getItem('recordsPerPage');
        return saved ? parseInt(saved, 10) : 10;
    });

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const fetchCourses = async () => {
        const res = await fetch(`http://localhost/abbey_app/Abbey_backend/courses.php?action=view`);
        const data = await res.json();
        setCourses(data);
    };

    const fetchAttendance = async () => {
        const params = new URLSearchParams({ action: 'list' });
        if (searchId) params.append('student_id', searchId);
        if (searchName) params.append('student_name', searchName);
        if (searchCourse) params.append('course_id', searchCourse);
        if (searchDate) params.append('date', searchDate);

        const res = await fetch(`http://localhost/abbey_app/Abbey_backend/attendance.php?${params.toString()}`);
        const data = await res.json();
        setRecords(data);
    };

    useEffect(() => {
        fetchCourses();
        fetchAttendance();
    }, []);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchAttendance();
    };

    const handleClear = () => {
        setSearchId('');
        setSearchName('');
        setSearchCourse('');
        setSearchDate('');
        setSearchDay('');
        setCurrentPage(1);
        fetchAttendance();
    };

    const filterByDay = (record) => {
        if (!searchDay) return true;
        const day = new Date(record.created_at).toLocaleDateString('en-US', { weekday: 'long' });
        return day === searchDay;
    };

    const formatDate = (datetime) => datetime.split(' ')[0];
    const formatTime = (datetime) => datetime.split(' ')[1];

    const handleDownloadCSV = () => {
        const headers = ['Student ID', 'Student Name', 'Course', 'Date', 'Time', 'Status'];
        const rows = records
            .filter(filterByDay)
            .map((rec) => [
                rec.student_id,
                rec.student_name,
                rec.course_name,
                formatDate(rec.created_at),
                formatTime(rec.created_at),
                rec.status,
            ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance_records_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const filteredRecords = records.filter(filterByDay);
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    const handleRowsPerPageChange = (e) => {
        const value = Number(e.target.value);
        setRecordsPerPage(value);
        localStorage.setItem('recordsPerPage', value);
        setCurrentPage(1);
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
                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Student ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white placeholder:text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Student Name"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white placeholder:text-gray-400"
                    />
                    <select
                        value={searchCourse}
                        onChange={(e) => setSearchCourse(e.target.value)}
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

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative w-full">
                        <input
                            type="date"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                            className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-gray-200"
                        />
                        <div className="pointer-events-none absolute right-3 top-2.5">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <select
                        value={searchDay}
                        onChange={(e) => setSearchDay(e.target.value)}
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

            {/* Rows per page and record range */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-400">
                    Showing {showFrom}–{showTo} of {filteredRecords.length} records
                </div>
                <div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-wrap justify-end items-center mt-6 gap-4 py-3">


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

                            {/* Current page button */}
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


        </div>
    );
};

export default AttendanceView;
