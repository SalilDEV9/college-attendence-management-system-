import React, { useState } from 'react';
import { getAttendanceInsights } from '../services/geminiService';
import { MOCK_ATTENDANCE, MOCK_USERS, MOCK_COURSES } from '../data/mockData';

const GeminiInsights: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const exampleQueries = [
        "Show top 5 students with the lowest attendance percentage.",
        "Which course has the highest number of absences?",
        "List all students who were late more than once.",
        "What is the overall attendance rate for 'Introduction to Paleontology'?",
    ];

    const handleQuery = async (q: string) => {
        if (!q.trim()) return;
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const response = await getAttendanceInsights(q, MOCK_ATTENDANCE, MOCK_USERS, MOCK_COURSES);
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleExampleQueryClick = (example: string) => {
        setQuery(example);
        handleQuery(example);
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleQuery(query);
    }

    return (
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-lg shadow-lg text-white">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
                <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                AI Attendance Insights
            </h3>
            <div className="space-y-4">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., 'Who has perfect attendance?'"
                        className="w-full p-3 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="bg-yellow-400 text-blue-900 font-bold py-3 px-6 rounded-md hover:bg-yellow-300 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                           <svg className="animate-spin h-5 w-5 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Analyze'}
                    </button>
                </form>
                 <div className="flex flex-wrap gap-2">
                    <span className="text-xs self-center mr-2">Try:</span>
                    {exampleQueries.map((ex, i) => (
                        <button key={i} onClick={() => handleExampleQueryClick(ex)} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
                            {ex}
                        </button>
                    ))}
                </div>
                {error && <div className="bg-red-500/80 p-3 rounded-md">{error}</div>}
                 {(isLoading || result) && (
                    <div className="bg-white/10 p-4 rounded-md">
                        {isLoading && <p>Analyzing data with Gemini...</p>}
                        {result && (
                            <div className="prose prose-sm prose-invert max-w-none">
                                <p className="whitespace-pre-wrap font-sans text-white">{result}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeminiInsights;