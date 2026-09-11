import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

const CommitDiff = () => {
    const { username, repoName, oid } = useParams();
    const navigate = useNavigate();
    
    const [diffs, setDiffs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDiff = async () => {
            try {
                const res = await fetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/commit/${oid}/diff`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.status) {
                    setDiffs(data.diffs);
                } else {
                    setError(data.message || 'Failed to fetch diff');
                }
            } catch (err: any) {
                setError('Failed to load diff: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDiff();
    }, [username, repoName, oid]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="inline-block w-12 h-12 border-4 border-[#b428b4] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-semibold animate-pulse">Computing Diff...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="text-red-500 bg-red-50 px-6 py-4 rounded-lg shadow-sm border border-red-200">
                <h3 className="font-bold text-lg mb-2">Error</h3>
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Go Back</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Link to={`/`} className="hover:text-blue-600 font-semibold">{username}</Link>
                            <span>/</span>
                            <Link to={`/repo/${username}/${repoName}`} className="hover:text-blue-600 font-bold">{repoName}</Link>
                            <span>/</span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200 font-mono text-xs">{oid?.substring(0, 7)}</span>
                        </div>
                        <button 
                            onClick={() => navigate(`/repo/${username}/${repoName}?oid=${oid}`)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                        >
                            Browse Files at this Commit &gt;
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Commit Diff</h1>
                    <p className="text-gray-600">Showing changes for {diffs.length} file{diffs.length !== 1 ? 's' : ''}.</p>
                </div>

                {/* Diff Viewer */}
                <div className="flex flex-col gap-6">
                    {diffs.map((diff, index) => (
                        <div key={index} className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                            <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
                                <span className="font-mono text-sm font-semibold text-gray-700">{diff.filename}</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                    diff.status === 'added' ? 'bg-green-100 text-green-700' :
                                    diff.status === 'removed' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {diff.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="text-sm">
                                <ReactDiffViewer 
                                    oldValue={diff.oldContent} 
                                    newValue={diff.newContent} 
                                    splitView={true} 
                                    compareMethod={DiffMethod.WORDS}
                                    useDarkTheme={false}
                                    leftTitle={diff.status === 'added' ? undefined : "Previous"}
                                    rightTitle={diff.status === 'removed' ? undefined : "Current"}
                                />
                            </div>
                        </div>
                    ))}

                    {diffs.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-500">
                            No files were changed in this commit.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommitDiff;
