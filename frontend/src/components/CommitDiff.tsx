import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { 
    BookOpen, 
    Code, 
    FileText, 
    Columns, 
    Square, 
    GitCommit,
    Check
} from 'lucide-react';

const CommitDiff = () => {
    const { username, repoName, oid } = useParams();
    const navigate = useNavigate();
    
    const [diffs, setDiffs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [splitView, setSplitView] = useState(false); // Default to Unified like GitHub diffs

    useEffect(() => {
        const fetchDiff = async () => {
            try {
                const res = await fetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/commit/${oid}/diff`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.status) {
                    setDiffs(data.diffs || []);
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

    // Calculate additions and deletions statistics
    const calculateStats = () => {
        let additions = 0;
        let deletions = 0;

        diffs.forEach(diff => {
            const oldLines = (diff.oldContent || '').split('\n');
            const newLines = (diff.newContent || '').split('\n');

            if (diff.status === 'added') {
                additions += newLines.length;
            } else if (diff.status === 'removed') {
                deletions += oldLines.length;
            } else {
                // Rough estimate based on length difference
                if (newLines.length > oldLines.length) {
                    additions += (newLines.length - oldLines.length);
                } else if (oldLines.length > newLines.length) {
                    deletions += (oldLines.length - newLines.length);
                } else {
                    additions += 1;
                    deletions += 1;
                }
            }
        });

        return { additions, deletions };
    };

    const { additions, deletions } = calculateStats();

    if (loading) return (
        <div className="min-h-screen bg-[#f6f8fa] flex flex-col items-center justify-center">
            <div className="inline-block w-8 h-8 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-[#57606a]">Computing diff...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#f6f8fa] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-6 rounded-md shadow-sm border border-[#d0d7de] max-w-md w-full">
                <h3 className="text-base font-semibold text-[#cf222e] mb-2">Diff Error</h3>
                <p className="text-sm text-[#57606a] mb-4">{error}</p>
                <button 
                    onClick={() => navigate(-1)} 
                    className="px-3 py-1.5 bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] rounded-md text-xs font-semibold text-[#24292f]"
                >
                    &larr; Go Back
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col">
            <Navbar username={localStorage.getItem("username")} setIsAuthenticated={() => {}} navigate={navigate} />

            {/* Header */}
            <div className="bg-[#f6f8fa] border-b border-[#d0d7de] pt-4 pb-4 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center flex-wrap gap-2 text-sm sm:text-base">
                        <BookOpen className="w-4 h-4 text-[#57606a] shrink-0" />
                        <Link to={`/publicProfile/${username}`} className="text-[#0969da] hover:underline">
                            {username}
                        </Link>
                        <span className="text-[#57606a]">/</span>
                        <Link to={`/repo/${username}/${repoName}`} className="text-[#0969da] hover:underline font-semibold">
                            {repoName}
                        </Link>
                        <span className="text-[#57606a]">/</span>
                        <span className="font-mono text-xs text-[#57606a] bg-white border border-[#d0d7de] px-2 py-0.5 rounded-full">
                            {oid?.substring(0, 7)}
                        </span>
                    </div>

                    <button 
                        onClick={() => navigate(`/repo/${username}/${repoName}?oid=${oid}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] rounded-md text-xs font-semibold text-[#24292f] transition-colors"
                    >
                        <Code className="w-3.5 h-3.5 text-[#57606a]" />
                        <span>Browse Files at this Commit</span>
                    </button>
                </div>
            </div>

            {/* Main Diff Content */}
            <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
                {/* Stat Bar & Unified / Split Toggle */}
                <div className="bg-white border border-[#d0d7de] rounded-md p-3 px-4 flex flex-wrap items-center justify-between gap-3 shadow-sm text-xs">
                    <div className="flex items-center flex-wrap gap-2 text-[#57606a]">
                        <span className="font-semibold text-[#1f2328]">
                            Showing {diffs.length} changed file{diffs.length !== 1 ? 's' : ''}
                        </span>
                        <span>with</span>
                        <span className="font-semibold text-[#1a7f37]">+{additions} additions</span>
                        <span>and</span>
                        <span className="font-semibold text-[#cf222e]">-{deletions} deletions</span>
                    </div>

                    {/* GitHub Split / Unified Toggle */}
                    <div className="inline-flex items-center border border-[#d0d7de] rounded-md overflow-hidden bg-[#f6f8fa] p-0.5">
                        <button
                            onClick={() => setSplitView(false)}
                            className={`px-3 py-1 text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors ${
                                !splitView 
                                    ? 'bg-white shadow-xs text-[#1f2328] font-semibold' 
                                    : 'text-[#57606a] hover:text-[#1f2328]'
                            }`}
                        >
                            <Square className="w-3 h-3" />
                            <span>Unified</span>
                        </button>
                        <button
                            onClick={() => setSplitView(true)}
                            className={`px-3 py-1 text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors ${
                                splitView 
                                    ? 'bg-white shadow-xs text-[#1f2328] font-semibold' 
                                    : 'text-[#57606a] hover:text-[#1f2328]'
                            }`}
                        >
                            <Columns className="w-3 h-3" />
                            <span>Split</span>
                        </button>
                    </div>
                </div>

                {/* Diff Viewer Files */}
                <div className="space-y-4">
                    {diffs.map((diff, index) => (
                        <div key={index} className="bg-white border border-[#d0d7de] rounded-md overflow-hidden shadow-sm">
                            {/* File Header */}
                            <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-2 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-[#57606a]" />
                                    <span className="font-mono font-semibold text-[#1f2328]">{diff.filename}</span>
                                </div>
                                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                                    diff.status === 'added' 
                                        ? 'bg-[#dafbe1] text-[#1a7f37] border-[#4ac26b]' :
                                    diff.status === 'removed' 
                                        ? 'bg-[#ffebe9] text-[#cf222e] border-[#ff8182]' :
                                        'bg-[#ddf4ff] text-[#0969da] border-[#54aeff]'
                                }`}>
                                    {diff.status}
                                </span>
                            </div>

                            {/* Diff Content */}
                            <div className="text-xs font-mono">
                                <ReactDiffViewer 
                                    oldValue={diff.oldContent || ''} 
                                    newValue={diff.newContent || ''} 
                                    splitView={splitView} 
                                    compareMethod={DiffMethod.WORDS}
                                    useDarkTheme={false}
                                    leftTitle={diff.status === 'added' ? undefined : "Previous"}
                                    rightTitle={diff.status === 'removed' ? undefined : "Current"}
                                />
                            </div>
                        </div>
                    ))}

                    {diffs.length === 0 && (
                        <div className="border border-[#d0d7de] rounded-md bg-white p-12 text-center text-xs text-[#57606a]">
                            No files were changed in this commit.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommitDiff;
