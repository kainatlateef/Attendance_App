import { LayoutDashboard, ClipboardList, Users, BookOpen, Settings, LogOut, ChevronLeft } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isExpanded, setIsExpanded }) => {
    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, tab: 'dashboard' },
        { name: 'Attendance Record', icon: <ClipboardList size={20} />, tab: 'attendance' },
        { name: 'Student Management', icon: <Users size={20} />, tab: 'students' },
        { name: 'Course Management', icon: <BookOpen size={20} />, tab: 'courses' },

    ];

    return (
        <div
            className={`bg-slate-900 text-slate-100 fixed top-0 left-0 h-full flex flex-col justify-between transition-all duration-300 shadow-lg z-40 ${isExpanded ? 'w-64' : 'w-20'
                }`}
        >
            {/* Logo / Header */}
            <div className="flex justify-center py-6">
                {isExpanded ? (
                    <img
                        src="\logo.png" alt="Abbey College Logo"
                        className="w-48 h-auto"
                    />
                ) : (
                    <div
                        className="h-9 w-9 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-lg"
                        aria-label="Abbey College"
                    >
                        AC
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="p-4 flex-grow overflow-y-auto">
                <ul>
                    {navItems.map(item => (
                        <li key={item.tab} className="mb-2">
                            <button
                                onClick={() => setActiveTab(item.tab)}
                                className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors duration-200 ${activeTab === item.tab ? 'bg-slate-800' : 'hover:bg-slate-800'
                                    }`}
                                title={item.name}
                                aria-label={item.name}
                            >
                                {item.icon}
                                {isExpanded && <span className="ml-3">{item.name}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>


            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute top-1/2 -right-4 transform -translate-y-1/2 p-1 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition"
                title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
                aria-label="Toggle Sidebar"
            >
                <ChevronLeft
                    size={20}
                    className={`transition-transform duration-300 ${!isExpanded ? 'rotate-180' : ''}`}
                />
            </button>
        </div>
    );
};

export default Sidebar;
