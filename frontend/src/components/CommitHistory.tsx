import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { cachedFetch } from '../utils/apiCache';
import { 
    GitBranch, 
    Copy, 
    Check, 
    BookOpen, 
    GitCommit, 
    Code, 
    History 
} from 'lucide-react';

const CommitHistory = () => {
    const { username, repoName, branch } = useParams();
    const [commits, setCommits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedOid, setCopiedOid] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCommits = async () => {
            try {
                const data = await cachedFetch(
                    `https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/commits?branch=${branch || 'master'}`, 
                    { credentials: 'include' }
                );
                if (!data.status) throw new Error(data.message);
                setCommits(data.commits || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load commits');
            } finally {
                setLoading(false);
            }
        };

        fetchCommits();
    }, [username, repoName, branch]);

    const handleCopyOid = (oid: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(oid);
        setCopiedOid(oid);
        setTimeout(() => setCopiedOid(null), 2000);
    };

    const formatRelativeTime = (timestamp?: string) => {
        if (!timestamp) return 'recently';
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'recently';
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diffInSeconds < 60) return 'just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Group commits by date (e.g. 'Commits on Mar 11, 2026')
    const groupCommitsByDate = (commitsList: any[]) => {
        const groups: Record<string, any[]> = {};
        commitsList.forEach(commit => {
            let dateKey = 'Commits';
            if (commit.timestamp) {
                const d = new Date(commit.timestamp);
                if (!isNaN(d.getTime())) {
                    dateKey = `Commits on ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                }
            }
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(commit);
        });
        return groups;
    };

    const groupedCommits = groupCommitsByDate(commits);

    if (loading) return (
        <div className="min-h-screen bg-[#f6f8fa] flex flex-col items-center justify-center">
            <div className="inline-block w-8 h-8 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-[#57606a]">Loading commits...</p>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-md shadow-sm border border-[#d0d7de] max-w-md w-full">
                <h2 className="text-base font-semibold text-[#cf222e] mb-2">Error</h2>
                <p className="text-sm text-[#57606a] mb-4">{error}</p>
                <Link to={`/repo/${username}/${repoName}`} className="text-sm text-[#0969da] hover:underline">&larr; Return to repository</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col">
            <Navbar username={localStorage.getItem("username")} setIsAuthenticated={() => {}} navigate={navigate} />

            {/* Header with GitHub Breadcrumbs */}
            <div className="bg-[#f6f8fa] border-b border-[#d0d7de] pt-4 pb-4 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center flex-wrap gap-2 text-sm sm:text-base">
                        <BookOpen className="w-4 h-4 text-[#57606a] shrink-0" />
                        <Link to={username?.toLowerCase() === localStorage.getItem("username")?.toLowerCase() ? "/profile" : `/publicProfile/${username}`} className="text-[#0969da] hover:underline">
                            {username}
                        </Link>
                        <span className="text-[#57606a]">/</span>
                        <Link to={`/repo/${username}/${repoName}`} className="text-[#0969da] hover:underline font-semibold">
                            {repoName}
                        </Link>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f6f8fa] border border-[#d0d7de] rounded-md text-xs font-semibold text-[#24292f]">
                        <GitBranch className="w-3.5 h-3.5 text-[#57606a]" />
                        <span>{branch}</span>
                    </div>
                </div>
            </div>

            {/* Commits List Body */}
            <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-[#1f2328] flex items-center gap-2">
                        <History className="w-5 h-5 text-[#57606a]" />
                        Commit History
                    </h1>
                    <span className="text-xs text-[#57606a] font-medium">{commits.length} commits</span>
                </div>

                <div className="space-y-6">
                    {Object.entries(groupedCommits).map(([dateGroup, items]) => (
                        <div key={dateGroup} className="space-y-2">
                            {/* GitHub Date Header */}
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#57606a] pt-2">
                                <GitCommit className="w-4 h-4 text-[#57606a]" />
                                <span>{dateGroup}</span>
                            </div>

                            {/* Densified 1-row commit cards list */}
                            <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-sm divide-y divide-[#d0d7de]/70">
                                {items.map((commit: any) => (
                                    <div 
                                        key={commit.oid} 
                                        className="px-4 py-2.5 hover:bg-[#f6f8fa] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                    >
                                        {/* Left Side: Message + Author + Time */}
                                        <div className="min-w-0 flex-1">
                                            <div 
                                                onClick={() => navigate(`/repo/${username}/${repoName}/commit/${commit.oid}/diff`)}
                                                className="font-semibold text-sm text-[#1f2328] hover:text-[#0969da] hover:underline cursor-pointer truncate mb-1"
                                                title={commit.message}
                                            >
                                                {commit.message}
                                            </div>
                                            <div className="flex items-center gap-2 text-[#57606a]">
                                                {/* Author Avatar Circle */}
                                                <div className="w-4 h-4 rounded-full bg-[#afb8c1] text-white flex items-center justify-center font-semibold text-[9px] shrink-0">
                                                    {(commit.author || username || 'G').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-[#1f2328]">{commit.author || username}</span>
                                                <span>committed {formatRelativeTime(commit.timestamp)}</span>
                                            </div>
                                        </div>

                                        {/* Right Side: Copy Hash, Hash Link, Browse Repository */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {/* Copy Hash */}
                                            <button 
                                                onClick={(e) => handleCopyOid(commit.oid, e)}
                                                className="p-1 text-[#57606a] hover:text-[#0969da] rounded border border-transparent hover:border-[#d0d7de] hover:bg-[#eaeef2] transition-all"
                                                title="Copy full SHA"
                                            >
                                                {copiedOid === commit.oid ? (
                                                    <Check className="w-3.5 h-3.5 text-[#1a7f37]" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>

                                            {/* Monospace 7-char hash link to diff */}
                                            <button 
                                                onClick={() => navigate(`/repo/${username}/${repoName}/commit/${commit.oid}/diff`)}
                                                className="px-2 py-1 font-mono text-xs text-[#0969da] hover:bg-[#eaeef2] border border-[#d0d7de] rounded-md transition-colors"
                                                title="View diff for this commit"
                                            >
                                                {commit.oid.substring(0, 7)}
                                            </button>

                                            {/* View Diff button */}
                                            <button 
                                                onClick={() => navigate(`/repo/${username}/${repoName}/commit/${commit.oid}/diff`)}
                                                className="px-2.5 py-1 text-xs font-medium text-[#24292f] bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] rounded-md transition-colors"
                                            >
                                                View Diff
                                            </button>

                                            {/* < > Browse Code at this commit */}
                                            <button 
                                                onClick={() => navigate(`/repo/${username}/${repoName}?oid=${commit.oid}`)}
                                                className="p-1 text-[#57606a] hover:text-[#0969da] rounded border border-[#d0d7de] bg-[#f6f8fa] hover:bg-[#eaeef2] transition-colors"
                                                title="Browse the repository at this point in history"
                                            >
                                                <Code className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {commits.length === 0 && (
                        <div className="border border-[#d0d7de] rounded-md bg-white p-12 text-center text-xs text-[#57606a]">
                            No commits found for branch "{branch}".
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommitHistory;
