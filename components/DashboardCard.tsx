import React from 'react';

interface DashboardCardProps {
    title: string;
    value: string;
    icon: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4 transform hover:scale-[1.03] transition-transform duration-300 ease-in-out relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-800 group-hover:bg-opacity-80 dark:group-hover:bg-opacity-80 transition-all duration-300"></div>
            <div className="relative z-10 flex items-center space-x-4 w-full">
                <div className="bg-teal-100 dark:bg-gray-700 p-3 rounded-full group-hover:bg-white/50 transition-colors">
                    <svg className="w-6 h-6 text-teal-600 dark:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path>
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;