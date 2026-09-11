import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { cachedFetch } from '../utils/apiCache';

const CommitHistory = () => {
    const { username, repoName, branch } = useParams();
    const [commits, setCommits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCommits = async () => {
            try {
                // Pass ?branch=... to the backend to get branch-specific commits
                const data = await cachedFetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/commits?branch=${branch}`, { credentials: 'include' });
                if (!data.status) throw new Error(data.message);
                
                setCommits(data.commits);
            } catch (err: any) {
                setError(err.message || 'Failed to load commits');
            } finally {
                setLoading(false);
            }
        };

        fetchCommits();
    }, [username, repoName, branch]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="inline-block w-12 h-12 border-4 border-[#b428b4] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl border-l-4 border-red-500 max-w-md w-full">
                <p className="text-gray-700">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            <Navbar username={localStorage.getItem("username")} setIsAuthenticated={()=>{}} navigate={navigate} />

            <div className="bg-white border-b border-gray-200 pt-6 pb-4 px-8 shadow-sm">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-2 text-xl font-semibold mb-3">
                        <Link to={`/publicProfile/${username}`} className="text-[#3023ae] hover:underline hover:text-[#b428b4] transition-colors">{username}</Link>
                        <span className="text-gray-400 font-light">/</span>
                        <Link to={`/repo/${username}/${repoName}`} className="text-gray-800 font-bold hover:underline">{repoName}</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto py-8 px-4">
                <h2 className="text-2xl font-bold mb-6">Commit History</h2>
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                    {commits.map((commit, idx) => (
                        <div key={idx} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-gray-800 text-lg mb-1">{commit.message}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="font-bold text-gray-700">{commit.author || username}</span>
                                    <span>committed</span>
                                </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-mono text-sm rounded transition-colors">
                                    {commit.oid.substring(0, 7)}
                                </button>
                                <button 
                                    onClick={() => navigate(`/repo/${username}/${repoName}/commit/${commit.oid}/diff`)}
                                    title="View what changed in this commit"
                                    className="px-3 py-1 bg-white hover:bg-green-50 border border-green-200 text-green-600 font-semibold text-sm rounded transition-colors"
                                >
                                    View Diff
                                </button>
                                <button 
                                    onClick={() => navigate(`/repo/${username}/${repoName}?oid=${commit.oid}`)}
                                    title="Browse repository at this point in history"
                                    className="px-3 py-1 bg-white hover:bg-blue-50 border border-blue-200 text-blue-600 font-semibold text-sm rounded transition-colors"
                                >
                                    &lt;&gt;
                                </button>
                            </div>
                        </div>
                    ))}
                    {commits.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No commits found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommitHistory;
