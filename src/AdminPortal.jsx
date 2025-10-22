import React, { useState } from 'react';
import QRCode from 'qrcode';
import {
  LogOut,
  Download,
} from 'lucide-react';

import AttendanceView from './views/AttendanceView';
import DashboardView from './views/DashboardView';
import StudentsView from './views/StudentsView';
import CoursesView from './views/CoursesView';
import Sidebar from './views/SideBarView';


const AdminPortal = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const tabTitles = {
    dashboard: 'Dashboard_----',
    students: 'Student Records',
    courses: 'Course Management',
    attendance: 'Attendance Records',

  };

  const currentTitle = tabTitles[activeTab];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            totalStudents={students.length}
            totalCourses={courses.length}
            todayAttendance={attendanceRecords.length}
          />
        );
      case 'students':
        return <StudentsView students={students} courses={courses} setStudents={setStudents} />;
      case 'courses':
        return <CoursesView courses={courses} setCourses={setCourses} />;
      case 'attendance':
        return <AttendanceView records={attendanceRecords} courses={courses} />;

      default:
        return (
          <DashboardView
            totalStudents={students.length}
            totalCourses={courses.length}
            todayAttendance={attendanceRecords.length}
          />
        );
    }
  };

  const downloadStudentPortalQRCode = async () => {
    try {
      const timestamp = Date.now(); // current time in ms
      const token = btoa(timestamp.toString()); // simple base64 encoding (not secure, but illustrative)

      const studentPortalUrl = `${window.location.origin}/student?token=${token}`;

      const dataUrl = await QRCode.toDataURL(studentPortalUrl);

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `StudentPortalQRCode_${new Date(timestamp).toISOString()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    }
  };

  return (
    <div className="flex bg-slate-950 min-h-screen font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <header className="p-4 bg-slate-900 shadow-sm flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-100">{currentTitle}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-400">{user?.email || 'Admin'}</span>

            {/* Logout Button */}
            <button
              className="flex items-center px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 ml-4"
              onClick={() => {
                localStorage.removeItem('user'); // clear logged-in user
                onLogout(); // call parent handler to switch to login screen
              }}
            >
              <LogOut size={18} />
              <span className="text-sm ml-1">Logout</span>
            </button>

            {/* Download Student Portal QR Code */}
            <button
              className="flex items-center px-4 py-2 bg-blue-500 rounded-lg hover:bg-green-600 ml-4"
              onClick={downloadStudentPortalQRCode}
            >
              <Download size={18} />
              <span className="text-sm ml-1">Download Student Portal QR</span>
            </button>
          </div>
        </header>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPortal;
