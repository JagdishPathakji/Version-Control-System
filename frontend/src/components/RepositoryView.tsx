import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { cachedFetch, clearCache } from '../utils/apiCache';

const RepositoryView = () => {
    const { username, repoName } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Parse query parameters
    const queryParams = new URLSearchParams(location.search);
    const targetOid = queryParams.get('oid');
    
    const [repoInfo, setRepoInfo] = useState<any>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [files, setFiles] = useState<any[]>([]);
    const [commits, setCommits] = useState<any[]>([]);
    const [branches, setBranches] = useState<string[]>([]);
    // If browsing history (targetOid), display that OID instead of branch name
    const [selectedBranch, setSelectedBranch] = useState<string>(targetOid ? targetOid.substring(0, 7) : 'master');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMerging, setIsMerging] = useState(false);

    const handleMerge = async () => {
        if (!confirm(`Are you sure you want to merge ${selectedBranch} into master?`)) return;
        setIsMerging(true);
        try {
            const res = await fetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/merge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ baseBranch: 'master', compareBranch: selectedBranch }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.status) {
                alert("Successfully merged into master!");
                clearCache(`/repo/${username}/${repoName}`);
                navigate(`/repo/${username}/${repoName}`);
                window.location.reload();
            } else {
                alert(data.message || "Failed to merge");
            }
        } catch (err: any) {
            alert(err.message || "Error merging");
        } finally {
            setIsMerging(false);
        }
    };

    useEffect(() => {
        const fetchRepoData = async () => {
            try {
                const data = await cachedFetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}`, { credentials: 'include' });
                if (!data.status) throw new Error(data.message);
                
                setRepoInfo(data.repo);
                setIsEmpty(data.isEmpty);

                if (!data.isEmpty) {
                    const branchesData = await cachedFetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/branches`, { credentials: 'include' });
                    if (branchesData.status && branchesData.branches.length > 0) {
                        // Filter out accidental branches created from commit hashes
                        const validBranches = branchesData.branches.filter((b: string) => !/^[0-9a-f]{7,40}$/i.test(b));
                        setBranches(validBranches);
                        if (!targetOid && validBranches.length > 0 && !validBranches.includes(selectedBranch)) {
                            setSelectedBranch(validBranches[0]);
                        }
                    }

                    // Passed branch query param to the backend files/commits endpoints
                    const filesUrl = targetOid 
                        ? `https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/files?oid=${targetOid}`
                        : `https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/files?branch=${selectedBranch}`;
                        
                    const [filesData, commitsData] = await Promise.all([
                        cachedFetch(filesUrl, { credentials: 'include' }),
                        cachedFetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/commits?branch=${selectedBranch}`, { credentials: 'include' })
                    ]);
                    
                    if (filesData.status) setFiles(filesData.files);
                    if (commitsData.status) setCommits(commitsData.commits);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load repository');
            } finally {
                setLoading(false);
            }
        };
        fetchRepoData();
    }, [username, repoName, selectedBranch, targetOid]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="inline-block w-12 h-12 border-4 border-[#b428b4] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-semibold text-lg">Loading Repository...</p>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl border-l-4 border-red-500 max-w-md w-full">
                <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
                <p className="text-gray-700">{error}</p>
            </div>
        </div>
    );

    const s3Url = `s3://girgit-project/${username}/${repoName}`;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            <Navbar username={localStorage.getItem("username")} setIsAuthenticated={()=>{}} navigate={navigate} />

            {/* Header / Navigation Bar */}
            <div className="bg-white border-b border-[#b428b4]/20 pt-8 pb-6 px-8 shadow-sm">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-2xl mb-2">
                            <span className="text-gray-400">
                                {repoInfo?.isPrivate ? '🔒' : '🌐'}
                            </span>
                            <Link to={`/publicProfile/${username}`} className="text-[#3023ae] hover:underline hover:text-[#b428b4] transition-colors">{username}</Link>
                            <span className="text-gray-400 font-light">/</span>
                            <span className="text-gray-800 font-bold">{repoName}</span>
                            <span className="ml-3 px-3 py-1 text-xs font-semibold border border-[#b428b4]/30 rounded-full text-[#b428b4] bg-[#b428b4]/5 shadow-sm">
                                {repoInfo?.isPrivate ? 'Private' : 'Public'}
                            </span>
                        </div>
                        {repoInfo?.description && <p className="text-gray-500 text-sm">{repoInfo.description}</p>}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto py-8 px-4">
                {isEmpty ? (
                    <div className="bg-white border border-[#b428b4]/20 rounded-xl p-8 sm:p-12 shadow-xl">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#b428b4] to-[#3023ae] bg-clip-text text-transparent mb-4">Repository is empty</h2>
                            <p className="text-gray-500">Get started by pushing some code from your command line.</p>
                        </div>

                        <div className="max-w-2xl mx-auto space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-2">Quick setup</h3>
                                <div className="bg-gray-900 p-5 rounded-lg text-gray-100 overflow-x-auto shadow-inner font-mono text-sm leading-relaxed border border-gray-800 relative">
                                    <p className="text-green-400"># Push an existing repository</p>
                                    <p>girgit remote add aws {s3Url}</p>
                                    <p>girgit push aws master</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-2">Create a new repository</h3>
                                <div className="bg-gray-900 p-5 rounded-lg text-gray-100 overflow-x-auto shadow-inner font-mono text-sm leading-relaxed border border-gray-800">
                                    <p>mkdir {repoName}</p>
                                    <p>cd {repoName}</p>
                                    <p>girgit init</p>
                                    <p>echo <span className="text-yellow-300">"# {repoName}"</span> &gt; README.md</p>
                                    <p>girgit commit -m <span className="text-yellow-300">"first commit"</span></p>
                                    <p>girgit remote add aws {s3Url}</p>
                                    <p>girgit push aws master</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Main File Explorer */}
                        <div className="lg:col-span-3 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <select 
                                        value={selectedBranch}
                                        onChange={(e) => {
                                            if (e.target.value !== targetOid?.substring(0, 7)) {
                                                navigate(`/repo/${username}/${repoName}`);
                                                setSelectedBranch(e.target.value);
                                            }
                                        }}
                                        className="bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded focus:ring-[#3023ae] focus:border-[#3023ae] block px-3 py-1.5 font-semibold"
                                    >
                                        {targetOid && (
                                            <option value={targetOid.substring(0, 7)}>
                                                Commit: {targetOid.substring(0, 7)}
                                            </option>
                                        )}
                                        {branches.length > 0 ? branches.map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        )) : <option value="master">master</option>}
                                    </select>
                                </div>
                                <div className="flex gap-4">
                                    {selectedBranch !== 'master' && !targetOid && (
                                        <button 
                                            onClick={handleMerge}
                                            disabled={isMerging}
                                            className="px-3 py-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-semibold text-sm rounded transition-colors"
                                        >
                                            {isMerging ? 'Merging...' : 'Merge into master'}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => navigate(`/repo/${username}/${repoName}/commits/${selectedBranch}`)}
                                        className="text-gray-600 hover:text-blue-600 font-semibold text-sm flex items-center gap-1 transition-colors"
                                    >
                                        🕒 {commits.length} Commits &gt;
                                    </button>
                                </div>
                            </div>

                            <div className="border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
                            {commits.length > 0 && (
                                (() => {
                                    const activeCommit = targetOid ? commits.find(c => c.oid === targetOid) : commits[0];
                                    if (!activeCommit) return null;
                                    return (
                                        <div className="bg-blue-50 border-b border-blue-200 p-3 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="font-semibold text-gray-800">{activeCommit.author || username}</div>
                                                <div className="text-gray-600 hover:text-blue-600 cursor-pointer">{activeCommit.message}</div>
                                            </div>
                                            <div className="text-gray-500 flex items-center gap-3 text-sm">
                                                <span className="font-mono text-xs">{activeCommit.oid.substring(0, 7)}</span>
                                            </div>
                                        </div>
                                    );
                                })()
                            )}
                            
                            <div className="bg-white border-t border-gray-300 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <tbody>
                                        {files.map((file, idx) => (
                                            <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 w-10 text-center">
                                                    {file.type === 'tree' ? (
                                                        <span className="text-blue-400 text-lg">📁</span>
                                                    ) : (
                                                        <span className="text-gray-400 text-lg">📄</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-2 font-medium">
                                                    <Link 
                                                        to={file.type === 'tree' ? `/repo/${username}/${repoName}?oid=${file.oid}` : `/repo/${username}/${repoName}/blob/${selectedBranch}/${file.name}`}
                                                        state={{ oid: file.oid }}
                                                        className={file.type === 'tree' ? 'text-[#3023ae] cursor-pointer hover:underline' : 'text-gray-800 hover:text-blue-600 hover:underline'}
                                                    >
                                                        {file.name}
                                                    </Link>
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-500 font-mono text-xs hidden sm:table-cell">
                                                    {file.oid.substring(0, 7)}
                                                </td>
                                            </tr>
                                        ))}
                                        {files.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center text-gray-500">
                                                    No files found in the current directory.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        </div>
                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">About</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {repoInfo?.description || "No description, website, or topics provided."}
                                </p>
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <span>🌐 S3 Backend Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RepositoryView;
