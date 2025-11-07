import React, { useContext, useState, useMemo } from 'react';
import { AuthContext, ToastContext } from '../App';
import { Role, Course, User, AttendanceRecord, AttendanceStatus } from '../types';
import { MOCK_COURSES, MOCK_USERS, MOCK_ATTENDANCE, MOCK_ENROLLMENTS } from '../data/mockData';
import GeminiInsights from './GeminiInsights';
import DashboardCard from './DashboardCard';

// --- Reusable Components (defined here due to file constraints) ---

const generateColor = (name: string) => {
    let hash = 0;
    if (name.length === 0) return `hsl(0, 0%, 80%)`;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    const h = hash % 360;
    return `hsl(${h}, 50%, 60%)`;
};

const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' }> = ({ name, size = 'sm' }) => {
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const sizeClasses = size === 'sm' ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base';
    return (
        <div
            className={`rounded-full flex items-center justify-center font-bold text-white ${sizeClasses} select-none flex-shrink-0`}
            style={{ backgroundColor: generateColor(name) }}
        >
            {initials}
        </div>
    );
};

const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
        case AttendanceStatus.Present: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case AttendanceStatus.Absent: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case AttendanceStatus.Late: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
    const colorClass = percentage > 85 ? 'bg-green-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
}

// --- Modals ---
const UserManagementModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user: Partial<User> | null;
}> = ({ isOpen, onClose, onSave, user }) => {
    const [formData, setFormData] = useState<Partial<User> | null>(null);

    React.useEffect(() => {
        setFormData(user);
    }, [user]);

    if (!isOpen || !formData) return null;

    const isEditing = !!formData.id;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.email && formData.role) {
            onSave(formData as User);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md z-50 m-4 animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">{isEditing ? 'Edit User' : 'Add New User'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                            <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                            <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                         <div>
                            <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Role</label>
                            <select name="role" id="role" value={formData.role || ''} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} className="py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Cancel</button>
                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Dashboards ---

const AdminDashboard: React.FC = () => {
    const { user: currentUser } = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);

    const handleOpenAddModal = () => {
        setSelectedUser({ name: '', email: '', role: Role.Pending });
        setIsModalOpen(true);
    };
    
    const handleOpenEditModal = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };
    
    const handleDeleteUser = (userId: number) => {
        if (currentUser?.id === userId) {
            showToast("You cannot delete your own account.", 'error');
            return;
        }
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            setUsers(users.filter(u => u.id !== userId));
            showToast("User deleted successfully.", 'success');
        }
    };

    const handleSaveUser = (userToSave: User) => {
        if (userToSave.id) { // Existing user
            setUsers(users.map(u => u.id === userToSave.id ? userToSave : u));
            showToast("User updated successfully.", 'success');
        } else { // New user
            const newUserWithId = { ...userToSave, id: Math.max(...users.map(u => u.id), 0) + 1 };
            setUsers([...users, newUserWithId]);
            showToast("User added successfully.", 'success');
        }
        handleCloseModal();
    };
    
    const handleExportCSV = () => {
        const headers = ['id', 'name', 'email', 'role'];
        const csvRows = [
            headers.join(','),
            ...users.map(user => 
                [user.id, `"${user.name}"`, `"${user.email}"`, user.role].join(',')
            )
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'users.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        showToast("User data exported.", 'info');
    };

    return (
        <div className="space-y-8">
            <UserManagementModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveUser} user={selectedUser} />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Total Users" value={users.length.toString()} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.002 3.002 0 01-3.356-1.857M3 14a3 3 0 116 0m-6 0a3 3 0 006 0" />
                <DashboardCard title="Total Courses" value={MOCK_COURSES.length.toString()} icon="M12 6.253v11.494m-9-5.747h18" />
                 <DashboardCard title="Teachers" value={users.filter(u => u.role === Role.Teacher).length.toString()} icon="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <DashboardCard title="Students" value={users.filter(u => u.role === Role.Student).length.toString()} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.292M15 21H3v-1a6 6 0 0112 0v1z" />
            </div>
            <GeminiInsights />
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Manage Users</h3>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleExportCSV} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <span>Export CSV</span>
                        </button>
                        <button onClick={handleOpenAddModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-transform transform hover:-translate-y-0.5">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            <span>Add User</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">User</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <Avatar name={user.name} />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                <div className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${user.role === Role.Admin ? 'bg-blue-200 text-blue-800' : user.role === Role.Teacher ? 'bg-teal-200 text-teal-800' : user.role === Role.Student ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-4">
                                        <button onClick={() => handleOpenEditModal(user)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const TeacherDashboard: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);
    const teacherCourses = useMemo(() => MOCK_COURSES.filter(c => c.teacherId === user!.id), [user]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(teacherCourses[0] || null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const enrolledStudents = useMemo(() => {
        if (!selectedCourse) return [];
        const studentIds = MOCK_ENROLLMENTS.filter(e => e.courseId === selectedCourse.id).map(e => e.studentId);
        return MOCK_USERS.filter(u => studentIds.includes(u.id));
    }, [selectedCourse]);

    const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
        setAttendance(prev => {
            const existingRecordIndex = prev.findIndex(r => r.studentId === studentId && r.courseId === selectedCourse!.id && r.date === selectedDate);
            if (existingRecordIndex > -1) {
                const updated = [...prev];
                updated[existingRecordIndex] = { ...updated[existingRecordIndex], status };
                return updated;
            }
            const newRecord: AttendanceRecord = { id: Date.now(), studentId, courseId: selectedCourse!.id, date: selectedDate, status };
            return [...prev, newRecord];
        });
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Teacher Dashboard</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Mark Attendance</h3>
                <div className="flex flex-wrap gap-4 mb-4">
                    <select value={selectedCourse?.id || ''} onChange={e => setSelectedCourse(MOCK_COURSES.find(c => c.id === parseInt(e.target.value)) || null)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="">Select a course</option>
                        {teacherCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                </div>
                {selectedCourse ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Student</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrolledStudents.map(student => {
                                    const record = attendance.find(r => r.studentId === student.id && r.courseId === selectedCourse.id && r.date === selectedDate);
                                    return (
                                        <tr key={student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar name={student.name} />
                                                    <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select value={record?.status || ''} onChange={e => handleStatusChange(student.id, e.target.value as AttendanceStatus)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                                    <option value="">Not Marked</option>
                                                    {Object.values(AttendanceStatus).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="flex justify-end mt-6">
                            <button onClick={() => showToast('Attendance saved successfully!', 'success')} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                Save Attendance
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>Select a course to start marking attendance.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const StudentDashboard: React.FC = () => {
    const { user } = useContext(AuthContext);
    const studentAttendance = useMemo(() => MOCK_ATTENDANCE.filter(r => r.studentId === user!.id), [user]);
    
    const enrolledCourses = useMemo(() => {
        const courseIds = MOCK_ENROLLMENTS.filter(e => e.studentId === user!.id).map(e => e.courseId);
        return MOCK_COURSES.filter(c => courseIds.includes(c.id));
    }, [user]);
    
    const overallStats = useMemo(() => {
        const total = studentAttendance.length;
        if(total === 0) return { present: 0, absent: 0, late: 0, percentage: 0 };
        const present = studentAttendance.filter(r => r.status === AttendanceStatus.Present).length;
        const absent = studentAttendance.filter(r => r.status === AttendanceStatus.Absent).length;
        const late = studentAttendance.filter(r => r.status === AttendanceStatus.Late).length;
        const percentage = total > 0 ? ((present + late) / total * 100) : 0;
        return { present, absent, late, percentage: parseFloat(percentage.toFixed(1)) };
    }, [studentAttendance]);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Student Dashboard</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Overall Attendance" value={`${overallStats.percentage}%`} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                <DashboardCard title="Classes Attended" value={overallStats.present.toString()} icon="M5 13l4 4L19 7" />
                <DashboardCard title="Classes Absent" value={overallStats.absent.toString()} icon="M6 18L18 6M6 6l12 12" />
                <DashboardCard title="Classes Late" value={overallStats.late.toString()} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">My Courses</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {enrolledCourses.map(course => {
                    const courseAttendance = studentAttendance.filter(r => r.courseId === course.id);
                    const total = courseAttendance.length;
                    const present = courseAttendance.filter(r => r.status === AttendanceStatus.Present).length;
                    const late = courseAttendance.filter(r => r.status === AttendanceStatus.Late).length;
                    const percentage = total > 0 ? parseFloat((((present + late) / total) * 100).toFixed(1)) : 0;
                    
                    return (
                        <div key={course.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
                             <h4 className="text-xl font-semibold">{course.name}</h4>
                             <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendance</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{percentage}%</span>
                                </div>
                                <ProgressBar percentage={percentage} />
                             </div>
                             <div className="overflow-x-auto max-h-60">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-4 py-2">Date</th>
                                            <th scope="col" className="px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courseAttendance.sort((a,b) => b.date.localeCompare(a.date)).map(record => (
                                            <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <td className="px-4 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">{record.date}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)} capitalize`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                         </div>
                    );
                })}
            </div>
        </div>
    );
};


const Dashboard: React.FC = () => {
    const { user } = useContext(AuthContext);

    switch (user?.role) {
        case Role.Admin:
            return <AdminDashboard />;
        case Role.Teacher:
            return <TeacherDashboard />;
        case Role.Student:
            return <StudentDashboard />;
        default:
            return <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
                <p className="text-gray-600 dark:text-gray-400">Your account is pending approval from an administrator.</p>
            </div>;
    }
};

export default Dashboard;