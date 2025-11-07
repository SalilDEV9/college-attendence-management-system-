import React, { useState, useMemo, createContext } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import { User } from './types';
import { MOCK_USERS } from './data/mockData';

// --- Toast Notification System ---
interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

const Toast: React.FC<{ message: ToastMessage; onDismiss: () => void }> = ({ message, onDismiss }) => {
    const baseClasses = "flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:text-gray-400 dark:bg-gray-800 transform transition-all duration-300";
    const typeClasses = {
        success: 'text-green-500 bg-green-100 dark:bg-gray-800 dark:text-green-400',
        error: 'text-red-500 bg-red-100 dark:bg-gray-800 dark:text-red-400',
        info: 'text-blue-500 bg-blue-100 dark:bg-gray-800 dark:text-blue-400',
    };
    const iconPaths = {
        success: "M10 .5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19ZM8.5 11.5 6 9l-1 1 3.5 3.5L14 8l-1-1-4.5 4.5Z",
        error: "M10 .5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm0-3a1 1 0 0 1-1-1V7a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1Z",
        info: "M10 .5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19ZM9 12a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v3a1 1 0 0 1-1 1Zm1 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
    };

    return (
        <div className={baseClasses} role="alert">
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${typeClasses[message.type]} rounded-lg`}>
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d={iconPaths[message.type]} />
                </svg>
                <span className="sr-only">{message.type} icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">{message.message}</div>
            <button type="button" onClick={onDismiss} className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700">
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
            </button>
        </div>
    );
};

const ToastContainer: React.FC<{ toasts: ToastMessage[]; onDismiss: (id: number) => void }> = ({ toasts, onDismiss }) => (
    <div className="fixed top-5 right-5 z-[100]">
        {toasts.map(toast => (
            <Toast key={toast.id} message={toast} onDismiss={() => onDismiss(toast.id)} />
        ))}
    </div>
);


// --- Auth Context & App Component ---
export const AuthContext = React.createContext<{ 
    user: User | null; 
    login: (email: string, password: string) => boolean; 
    logout: () => void; 
}>({
    user: null,
    login: () => false,
    logout: () => {},
});

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = (message: string, type: ToastMessage['type']) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };
    
    const dismissToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const authContextValue = useMemo(() => ({
        user: currentUser,
        login: (email: string, password: string): boolean => {
            const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (user && password) { 
                setCurrentUser(user);
                showToast(`Welcome back, ${user.name}!`, 'success');
                return true;
            }
            return false;
        },
        logout: () => {
            setCurrentUser(null);
        },
    }), [currentUser]);

    return (
        <AuthContext.Provider value={authContextValue}>
            <ToastContext.Provider value={{ showToast }}>
                <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased">
                    <ToastContainer toasts={toasts} onDismiss={dismissToast} />
                    {currentUser ? <Layout /> : <Login />}
                </div>
            </ToastContext.Provider>
        </AuthContext.Provider>
    );
};

export default App;