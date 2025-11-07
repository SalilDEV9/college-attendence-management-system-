import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../App';
import Dashboard from './Dashboard';
import Chatbot from './Chatbot';
import { Role } from '../types';

const generateColor = (name: string) => {
    let hash = 0;
    if (name.length === 0) return `hsl(0, 0%, 80%)`;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    const h = hash % 360;
    return `hsl(${h}, 60%, 55%)`;
};

const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' }> = ({ name, size = 'md' }) => {
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-base';
    return (
        <div
            className={`rounded-full flex items-center justify-center font-bold text-white ${sizeClasses} select-none`}
            style={{ backgroundColor: generateColor(name) }}
        >
            {initials}
        </div>
    );
};

const SidebarIcon: React.FC<{ d: string }> = ({ d }) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d}></path>
    </svg>
);

const NavLink: React.FC<{ icon: string; label: string; roles: Role[]; currentRole: Role; onClick?: () => void }> = ({ icon, label, roles, currentRole, onClick }) => {
    if (!roles.includes(currentRole)) return null;
    return (
        <a href="#" onClick={onClick} className="flex items-center space-x-3 text-gray-300 hover:bg-teal-600 hover:text-white rounded-md px-3 py-2 transition-colors duration-200">
            <SidebarIcon d={icon} />
            <span className="font-medium">{label}</span>
        </a>
    );
};

const UserMenu: React.FC = () => {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
                <Avatar name={user.name} size="sm" />
                <span className="hidden sm:inline font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 text-xs text-gray-400">{user.role}</div>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); logout(); }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <SidebarIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        <span className="ml-2">Logout</span>
                    </a>
                </div>
            )}
        </div>
    );
}


const Layout: React.FC = () => {
    const { user, logout } = useContext(AuthContext);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <aside className={`absolute md:relative z-30 w-64 bg-gray-800 dark:bg-gray-900 text-white flex-shrink-0 inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out bg-gradient-to-b from-blue-800 to-teal-700`}>
                <div className="flex items-center justify-center h-20 border-b border-teal-600/50">
                    <h1 className="text-2xl font-bold tracking-wider">ATTENDANCE</h1>
                </div>
                <nav className="mt-6 px-4 flex flex-col h-[calc(100%-80px)]">
                    <div className="flex-grow">
                        <NavLink icon="M3 10h18M3 14h18M3 6h18" label="Dashboard" roles={[Role.Admin, Role.Teacher, Role.Student]} currentRole={user!.role} />
                        <NavLink icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.002 3.002 0 01-3.356-1.857M3 14a3 3 0 116 0m-6 0a3 3 0 006 0" label="Manage Users" roles={[Role.Admin]} currentRole={user!.role} />
                        <NavLink icon="M12 6.253v11.494m-9-5.747h18" label="Manage Courses" roles={[Role.Admin]} currentRole={user!.role} />
                        <NavLink icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" label="Mark Attendance" roles={[Role.Teacher]} currentRole={user!.role} />
                        <NavLink icon="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" label="My Attendance" roles={[Role.Student]} currentRole={user!.role} />
                    </div>
                     <div className="pb-4">
                       <button onClick={logout} className="w-full flex items-center space-x-3 text-gray-300 hover:bg-red-600/80 hover:text-white rounded-md px-3 py-3 transition-colors duration-200">
                            <SidebarIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </nav>
            </aside>

             {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"></div>}

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-500 dark:text-gray-400 focus:outline-none">
                            <SidebarIcon d="M4 6h16M4 12h16M4 18h16" />
                        </button>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 hidden sm:block">Dashboard</h2>
                    </div>
                    <UserMenu />
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
                    <Dashboard />
                </main>
            </div>
            <Chatbot />
        </div>
    );
};

export default Layout;