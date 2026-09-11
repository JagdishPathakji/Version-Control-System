import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { cachedFetch, clearCache } from '../utils/apiCache';
import { 
    GitBranch, 
    Copy, 
    Check, 
    Download, 
    Star, 
    GitFork, 
    Eye, 
    Code2, 
    CircleDot, 
    GitPullRequest, 
    Play, 
    Shield, 
    History, 
    Folder, 
    FileText, 
    BookOpen, 
    Tag, 
    ChevronDown,
    GitMerge,
    Terminal
} from 'lucide-react';

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
    const [selectedBranch, setSelectedBranch] = useState<string>(targetOid ? targetOid.substring(0, 7) : 'master');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMerging, setIsMerging] = useState(false);
    
    // UI interactive states
    const [copiedClone, setCopiedClone] = useState(false);
    const [copiedInitSnippet, setCopiedInitSnippet] = useState(false);
    const [copiedPushSnippet, setCopiedPushSnippet] = useState(false);
    const [showCodeDropdown, setShowCodeDropdown] = useState(false);
    const [showBranchDropdown, setShowBranchDropdown] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isStarred, setIsStarred] = useState(false);
    const [starCount, setStarCount] = useState(0);
    const [activeTab, setActiveTab] = useState('code');

    const s3Url = `s3://girgit-project/${username}/${repoName}`;

    const handleCopyClone = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        navigator.clipboard.writeText(s3Url);
        setCopiedClone(true);
        setTimeout(() => setCopiedClone(false), 2000);
    };

    const handleCopySnippet = (snippetText: string, type: 'init' | 'push') => {
        navigator.clipboard.writeText(snippetText);
        if (type === 'init') {
            setCopiedInitSnippet(true);
            setTimeout(() => setCopiedInitSnippet(false), 2000);
        } else {
            setCopiedPushSnippet(true);
            setTimeout(() => setCopiedPushSnippet(false), 2000);
        }
    };

    const handleDownloadZip = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsDownloading(true);
        const downloadUrl = `https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/zip?branch=${selectedBranch}${targetOid ? `&oid=${targetOid}` : ''}`;
        window.location.href = downloadUrl;
        setTimeout(() => setIsDownloading(false), 2000);
    };

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
                alert('Successfully merged into master!');
                clearCache(`/repo/${username}/${repoName}`);
                navigate(`/repo/${username}/${repoName}`);
                window.location.reload();
            } else {
                alert(data.message || 'Failed to merge');
            }
        } catch (err: any) {
            alert(err.message || 'Error merging');
        } finally {
            setIsMerging(false);
        }
    };

    const toggleStar = () => {
        setIsStarred(!isStarred);
        setStarCount(prev => isStarred ? Math.max(0, prev - 1) : prev + 1);
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
                        const validBranches = branchesData.branches.filter((b: string) => !/^[0-9a-f]{7,40}$/i.test(b));
                        setBranches(validBranches);
                        if (!targetOid && validBranches.length > 0 && !validBranches.includes(selectedBranch)) {
                            setSelectedBranch(validBranches[0]);
                        }
                    }

                    const filesUrl = targetOid 
                        ? `https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/files?oid=${targetOid}`
                        : `https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/files?branch=${selectedBranch}`;
                        
                    const [filesData, commitsData] = await Promise.all([
                        cachedFetch(filesUrl, { credentials: 'include' }),
                        cachedFetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/commits?branch=${selectedBranch}`, { credentials: 'include' })
                    ]);
                    
                    if (filesData.status) setFiles(filesData.files || []);
                    if (commitsData.status) setCommits(commitsData.commits || []);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load repository');
            } finally {
                setLoading(false);
            }
        };
        fetchRepoData();
    }, [username, repoName, selectedBranch, targetOid]);

    // Format relative time helper
    const formatTimeAgo = (timestamp?: string) => {
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

    // Calculate Language Breakdown
    const getLanguageBreakdown = () => {
        if (!files || files.length === 0) return null;
        
        const langCounts: Record<string, { count: number, color: string }> = {};
        let totalCodeFiles = 0;
        
        files.forEach(f => {
            if (f.type !== 'blob') return;
            const parts = f.name.split('.');
            if (parts.length < 2) return;
            const ext = parts[parts.length - 1].toLowerCase();
            
            let lang = 'Other';
            let color = 'bg-[#8b949e]';
            
            switch (ext) {
                case 'js': case 'jsx': lang = 'JavaScript'; color = 'bg-[#f1e05a]'; break;
                case 'ts': case 'tsx': lang = 'TypeScript'; color = 'bg-[#3178c6]'; break;
                case 'py': lang = 'Python'; color = 'bg-[#3572A5]'; break;
                case 'html': lang = 'HTML'; color = 'bg-[#e34c26]'; break;
                case 'css': lang = 'CSS'; color = 'bg-[#563d7c]'; break;
                case 'json': lang = 'JSON'; color = 'bg-[#292929]'; break;
                case 'md': lang = 'Markdown'; color = 'bg-[#083fa1]'; break;
                case 'java': lang = 'Java'; color = 'bg-[#b07219]'; break;
                case 'cpp': case 'c': lang = 'C++'; color = 'bg-[#f34b7d]'; break;
                case 'go': lang = 'Go'; color = 'bg-[#00ADD8]'; break;
                case 'rs': lang = 'Rust'; color = 'bg-[#dea584]'; break;
            }
            
            if (lang !== 'Other' && lang !== 'Markdown' && lang !== 'JSON') {
                if (!langCounts[lang]) langCounts[lang] = { count: 0, color };
                langCounts[lang].count++;
                totalCodeFiles++;
            }
        });
        
        if (totalCodeFiles === 0) return null;
        
        const breakdown = Object.entries(langCounts).map(([lang, data]) => ({
            lang,
            color: data.color,
            percentage: ((data.count / totalCodeFiles) * 100).toFixed(1)
        })).sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
        
        return breakdown;
    };
    
    const languageBreakdown = getLanguageBreakdown();

    // Extract unique contributors from commits
    const contributors = Array.from(new Set(commits.map(c => c.author || username))).filter(Boolean);

    if (loading) return (
        <div className="min-h-screen bg-[#f6f8fa] flex flex-col items-center justify-center">
            <div className="inline-block w-8 h-8 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-[#57606a]">Loading repository...</p>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-md shadow-sm border border-[#d0d7de] max-w-md w-full">
                <h2 className="text-base font-semibold text-[#cf222e] mb-2">Repository unavailable</h2>
                <p className="text-sm text-[#57606a] mb-4">{error}</p>
                <Link to="/dashboard" className="text-sm text-[#0969da] hover:underline">&larr; Return to Dashboard</Link>
            </div>
        </div>
    );

    const latestCommit = targetOid ? commits.find(c => c.oid === targetOid) || commits[0] : commits[0];

    const initSnippet = `girgit init\ngirgit add .\ngirgit commit -m "first commit"\ngirgit branch -M main\ngirgit push ${s3Url}`;
    const pushSnippet = `girgit push ${s3Url}`;

    return (
        <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col">
            <Navbar username={localStorage.getItem("username")} setIsAuthenticated={() => {}} navigate={navigate} />

            {/* GitHub Repo Header */}
            <div className="bg-[#f6f8fa] border-b border-[#d0d7de] pt-4 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Top line: owner / repo, Public/Private badge, Watch/Fork/Star buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
                        <div className="flex items-center flex-wrap gap-2 text-xl">
                            <BookOpen className="w-5 h-5 text-[#57606a] shrink-0" />
                            <Link to={username?.toLowerCase() === localStorage.getItem("username")?.toLowerCase() ? "/profile" : `/publicProfile/${username}`} className="text-[#0969da] hover:underline font-normal">
                                {username}
                            </Link>
                            <span className="text-[#57606a]">/</span>
                            <Link to={`/repo/${username}/${repoName}`} className="text-[#0969da] hover:underline font-semibold">
                                {repoName}
                            </Link>
                            <span className="ml-1 px-2 py-0.5 text-xs font-medium border border-[#d0d7de] rounded-full text-[#57606a] bg-white">
                                {repoInfo?.isPrivate ? 'Private' : 'Public'}
                            </span>
                        </div>

                        {/* GitHub Action buttons */}
                        <div className="flex items-center gap-2 text-xs font-medium">
                            {/* Watch button */}
                            <div className="inline-flex items-center border border-[#d0d7de] rounded-md shadow-sm bg-[#f6f8fa] hover:bg-[#f3f4f6]">
                                <button className="flex items-center gap-1.5 px-3 py-1 text-[#24292f] border-r border-[#d0d7de]">
                                    <Eye className="w-3.5 h-3.5 text-[#57606a]" />
                                    <span>Watch</span>
                                </button>
                                <span className="px-2 py-1 text-[#57606a] bg-white rounded-r-md font-semibold">1</span>
                            </div>

                            {/* Fork button */}
                            <div className="inline-flex items-center border border-[#d0d7de] rounded-md shadow-sm bg-[#f6f8fa] hover:bg-[#f3f4f6]">
                                <button className="flex items-center gap-1.5 px-3 py-1 text-[#24292f] border-r border-[#d0d7de]">
                                    <GitFork className="w-3.5 h-3.5 text-[#57606a]" />
                                    <span>Fork</span>
                                </button>
                                <span className="px-2 py-1 text-[#57606a] bg-white rounded-r-md font-semibold">0</span>
                            </div>

                            {/* Star button */}
                            <div className="inline-flex items-center border border-[#d0d7de] rounded-md shadow-sm bg-[#f6f8fa] hover:bg-[#f3f4f6]">
                                <button 
                                    onClick={toggleStar}
                                    className="flex items-center gap-1.5 px-3 py-1 text-[#24292f] border-r border-[#d0d7de] transition-colors"
                                >
                                    <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-[#e3b341] fill-[#e3b341]' : 'text-[#57606a]'}`} />
                                    <span>{isStarred ? 'Starred' : 'Star'}</span>
                                </button>
                                <span className="px-2 py-1 text-[#57606a] bg-white rounded-r-md font-semibold">{starCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* GitHub Tab Bar */}
                    <div className="flex items-center gap-1 overflow-x-auto text-sm border-b border-transparent -mb-[1px]">
                        <button 
                            onClick={() => setActiveTab('code')}
                            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'code' 
                                    ? 'border-[#fd8c73] text-[#1f2328] font-semibold' 
                                    : 'border-transparent text-[#57606a] hover:text-[#1f2328] hover:border-[#d0d7de]'
                            }`}
                        >
                            <Code2 className="w-4 h-4" />
                            <span>Code</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('issues')}
                            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'issues' 
                                    ? 'border-[#fd8c73] text-[#1f2328] font-semibold' 
                                    : 'border-transparent text-[#57606a] hover:text-[#1f2328] hover:border-[#d0d7de]'
                            }`}
                        >
                            <CircleDot className="w-4 h-4" />
                            <span>Issues</span>
                            <span className="ml-0.5 px-1.5 py-0.2 text-xs bg-[#afb8c1]/20 rounded-full font-normal">0</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('pulls')}
                            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'pulls' 
                                    ? 'border-[#fd8c73] text-[#1f2328] font-semibold' 
                                    : 'border-transparent text-[#57606a] hover:text-[#1f2328] hover:border-[#d0d7de]'
                            }`}
                        >
                            <GitPullRequest className="w-4 h-4" />
                            <span>Pull requests</span>
                            <span className="ml-0.5 px-1.5 py-0.2 text-xs bg-[#afb8c1]/20 rounded-full font-normal">0</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('actions')}
                            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'actions' 
                                    ? 'border-[#fd8c73] text-[#1f2328] font-semibold' 
                                    : 'border-transparent text-[#57606a] hover:text-[#1f2328] hover:border-[#d0d7de]'
                            }`}
                        >
                            <Play className="w-4 h-4" />
                            <span>Actions</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('security')}
                            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'security' 
                                    ? 'border-[#fd8c73] text-[#1f2328] font-semibold' 
                                    : 'border-transparent text-[#57606a] hover:text-[#1f2328] hover:border-[#d0d7de]'
                            }`}
                        >
                            <Shield className="w-4 h-4" />
                            <span>Security</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Page Area */}
            <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {activeTab !== 'code' ? (
                    <div className="border border-[#d0d7de] rounded-md bg-white p-12 text-center text-[#57606a]">
                        <div className="max-w-md mx-auto">
                            <h3 className="text-lg font-semibold text-[#1f2328] mb-2 capitalize">{activeTab}</h3>
                            <p className="text-sm mb-4">There are no active {activeTab} for this repository.</p>
                            <button 
                                onClick={() => setActiveTab('code')}
                                className="px-3 py-1.5 text-xs font-semibold text-[#0969da] border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa]"
                            >
                                Back to code
                            </button>
                        </div>
                    </div>
                ) : isEmpty ? (
                    /* GitHub Empty Repository Quick Setup Box */
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-sm">
                            <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-3">
                                <h3 className="text-sm font-semibold text-[#1f2328]">
                                    Quick setup — if you've done this kind of thing before
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <p className="text-xs text-[#57606a]">
                                    Get started by cloning this repository's S3 Girgit URL:
                                </p>
                                <div className="flex items-center max-w-xl">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={s3Url} 
                                        className="flex-1 bg-[#f6f8fa] border border-[#d0d7de] rounded-l-md px-3 py-1.5 text-xs font-mono text-[#1f2328] select-all focus:outline-none"
                                    />
                                    <button 
                                        onClick={handleCopyClone}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f6f8fa] hover:bg-[#eaeef2] border border-l-0 border-[#d0d7de] rounded-r-md text-xs font-medium text-[#24292f] transition-colors"
                                    >
                                        {copiedClone ? <Check className="w-3.5 h-3.5 text-[#1a7f37]" /> : <Copy className="w-3.5 h-3.5 text-[#57606a]" />}
                                        <span>{copiedClone ? 'Copied' : 'Copy'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Create new repo command box */}
                        <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-sm">
                            <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-3 flex justify-between items-center">
                                <h4 className="text-sm font-semibold text-[#1f2328]">
                                    …or create a new repository on the command line
                                </h4>
                                <button 
                                    onClick={() => handleCopySnippet(initSnippet, 'init')}
                                    className="flex items-center gap-1 text-xs text-[#57606a] hover:text-[#0969da]"
                                >
                                    {copiedInitSnippet ? <Check className="w-3.5 h-3.5 text-[#1a7f37]" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedInitSnippet ? 'Copied' : 'Copy'}</span>
                                </button>
                            </div>
                            <div className="p-4 bg-[#f6f8fa] text-xs font-mono text-[#24292f] leading-relaxed select-all overflow-x-auto">
                                <pre>{initSnippet}</pre>
                            </div>
                        </div>

                        {/* Push existing repo command box */}
                        <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-sm">
                            <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-3 flex justify-between items-center">
                                <h4 className="text-sm font-semibold text-[#1f2328]">
                                    …or push an existing repository from the command line
                                </h4>
                                <button 
                                    onClick={() => handleCopySnippet(pushSnippet, 'push')}
                                    className="flex items-center gap-1 text-xs text-[#57606a] hover:text-[#0969da]"
                                >
                                    {copiedPushSnippet ? <Check className="w-3.5 h-3.5 text-[#1a7f37]" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedPushSnippet ? 'Copied' : 'Copy'}</span>
                                </button>
                            </div>
                            <div className="p-4 bg-[#f6f8fa] text-xs font-mono text-[#24292f] leading-relaxed select-all overflow-x-auto">
                                <pre>{pushSnippet}</pre>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Populated Repository View: 2 columns */
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Main File Explorer (3 columns) */}
                        <div className="lg:col-span-3 space-y-4">
                            {/* Actions Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    {/* Branch Selector */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] rounded-md text-xs font-semibold text-[#24292f] transition-colors shadow-sm"
                                        >
                                            <GitBranch className="w-3.5 h-3.5 text-[#57606a]" />
                                            <span className="max-w-[120px] truncate">{selectedBranch}</span>
                                            <ChevronDown className="w-3 h-3 text-[#57606a]" />
                                        </button>

                                        {showBranchDropdown && (
                                            <div className="absolute left-0 mt-1 w-64 bg-white border border-[#d0d7de] rounded-md shadow-lg z-30 py-1">
                                                <div className="px-3 py-2 border-b border-[#d0d7de] text-xs font-semibold text-[#57606a]">
                                                    Switch branches
                                                </div>
                                                <div className="max-h-56 overflow-y-auto py-1">
                                                    {branches.map(b => (
                                                        <button 
                                                            key={b}
                                                            onClick={() => {
                                                                setSelectedBranch(b);
                                                                setShowBranchDropdown(false);
                                                                navigate(`/repo/${username}/${repoName}`);
                                                            }}
                                                            className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#f6f8fa] ${
                                                                selectedBranch === b ? 'font-semibold text-[#0969da]' : 'text-[#24292f]'
                                                            }`}
                                                        >
                                                            <span className="truncate">{b}</span>
                                                            {selectedBranch === b && <Check className="w-3.5 h-3.5 text-[#0969da]" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Breadcrumb Path if viewing historical commit */}
                                    {targetOid && (
                                        <div className="flex items-center gap-1.5 text-xs text-[#57606a]">
                                            <span>tree /</span>
                                            <span className="font-mono text-[#0969da] font-medium">{targetOid.substring(0, 7)}</span>
                                            <Link 
                                                to={`/repo/${username}/${repoName}`}
                                                className="ml-2 text-xs text-[#0969da] hover:underline"
                                            >
                                                (back to main)
                                            </Link>
                                        </div>
                                    )}

                                    {/* Merge button if on a feature branch */}
                                    {selectedBranch !== 'master' && selectedBranch !== 'main' && !targetOid && (
                                        <button 
                                            onClick={handleMerge}
                                            disabled={isMerging}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] rounded-md text-xs font-semibold text-[#1a7f37] hover:border-[#1a7f37] transition-all shadow-sm disabled:opacity-50"
                                        >
                                            <GitMerge className="w-3.5 h-3.5" />
                                            <span>{isMerging ? 'Merging...' : `Merge into master`}</span>
                                        </button>
                                    )}
                                </div>

                                {/* Right action buttons: Commits History link & Green Code Dropdown */}
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => navigate(`/repo/${username}/${repoName}/commits/${selectedBranch}`)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#57606a] hover:text-[#0969da] transition-colors"
                                    >
                                        <History className="w-3.5 h-3.5" />
                                        <span><strong>{commits.length}</strong> commits</span>
                                    </button>

                                    {/* GitHub Green Code button */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowCodeDropdown(!showCodeDropdown)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
                                        >
                                            <Code2 className="w-3.5 h-3.5" />
                                            <span>Code</span>
                                            <ChevronDown className="w-3 h-3 ml-0.5" />
                                        </button>

                                        {showCodeDropdown && (
                                            <div className="absolute right-0 mt-1 w-80 bg-white border border-[#d0d7de] rounded-md shadow-lg z-30 p-4 space-y-3">
                                                <div className="flex items-center justify-between text-xs font-semibold text-[#24292f] border-b border-[#d0d7de] pb-2">
                                                    <span className="flex items-center gap-1.5">
                                                        <Terminal className="w-3.5 h-3.5 text-[#57606a]" />
                                                        Clone with Girgit S3
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <input 
                                                        type="text" 
                                                        readOnly 
                                                        value={s3Url} 
                                                        className="flex-1 bg-[#f6f8fa] border border-[#d0d7de] rounded-l-md px-2.5 py-1.5 text-xs font-mono text-[#1f2328] select-all focus:outline-none"
                                                    />
                                                    <button 
                                                        onClick={handleCopyClone}
                                                        className="flex items-center px-2.5 py-1.5 bg-[#f6f8fa] hover:bg-[#eaeef2] border border-l-0 border-[#d0d7de] rounded-r-md text-xs font-medium text-[#24292f]"
                                                        title="Copy URL"
                                                    >
                                                        {copiedClone ? <Check className="w-3.5 h-3.5 text-[#1a7f37]" /> : <Copy className="w-3.5 h-3.5 text-[#57606a]" />}
                                                    </button>
                                                </div>

                                                <div className="border-t border-[#d0d7de] pt-3">
                                                    <button 
                                                        onClick={handleDownloadZip}
                                                        disabled={isDownloading}
                                                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] rounded-md text-xs font-semibold text-[#24292f] transition-colors disabled:opacity-50"
                                                    >
                                                        <Download className="w-3.5 h-3.5 text-[#57606a]" />
                                                        <span>{isDownloading ? 'Preparing ZIP...' : 'Download ZIP'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* GitHub File Table Container */}
                            <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-sm text-sm">
                                {/* Top Commit Summary Bar */}
                                {latestCommit && (
                                    <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-2.5 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                                            {/* Initials Avatar */}
                                            <div className="w-5 h-5 rounded-full bg-[#afb8c1] text-white flex items-center justify-center font-semibold text-[10px] shrink-0">
                                                {(latestCommit.author || username || 'G').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-[#1f2328] shrink-0">
                                                {latestCommit.author || username}
                                            </span>
                                            <span 
                                                onClick={() => navigate(`/repo/${username}/${repoName}/commit/${latestCommit.oid}/diff`)}
                                                className="text-[#57606a] hover:text-[#0969da] truncate cursor-pointer"
                                                title={latestCommit.message}
                                            >
                                                {latestCommit.message}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 text-[#57606a]">
                                            <button 
                                                onClick={() => navigate(`/repo/${username}/${repoName}/commit/${latestCommit.oid}/diff`)}
                                                className="font-mono hover:text-[#0969da] text-xs"
                                            >
                                                {latestCommit.oid.substring(0, 7)}
                                            </button>
                                            <span>{formatTimeAgo(latestCommit.timestamp)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* File Rows Table */}
                                <table className="w-full text-left border-collapse">
                                    <tbody>
                                        {files.map((file, idx) => (
                                            <tr key={idx} className="border-b border-[#d0d7de]/50 hover:bg-[#f6f8fa] transition-colors last:border-b-0">
                                                {/* Icon */}
                                                <td className="py-2.5 pl-4 pr-1 w-8 text-center">
                                                    {file.type === 'tree' ? (
                                                        <Folder className="w-4 h-4 text-[#54aeff] fill-[#54aeff]" />
                                                    ) : (
                                                        <FileText className="w-4 h-4 text-[#57606a]" />
                                                    )}
                                                </td>

                                                {/* File Name */}
                                                <td className="py-2.5 px-2 font-medium max-w-[200px] truncate">
                                                    <Link 
                                                        to={file.type === 'tree' ? `/repo/${username}/${repoName}?oid=${file.oid}` : `/repo/${username}/${repoName}/blob/${selectedBranch}/${file.name}`}
                                                        state={{ oid: file.oid }}
                                                        className="text-[#1f2328] hover:text-[#0969da] hover:underline text-xs"
                                                    >
                                                        {file.name}
                                                    </Link>
                                                </td>

                                                {/* Last Commit Message Column */}
                                                <td className="py-2.5 px-4 text-xs text-[#57606a] truncate max-w-[280px] hidden md:table-cell">
                                                    {latestCommit?.message || 'Initial commit'}
                                                </td>

                                                {/* Relative Time Column */}
                                                <td className="py-2.5 pr-4 pl-2 text-right text-xs text-[#57606a] whitespace-nowrap">
                                                    {formatTimeAgo(latestCommit?.timestamp)}
                                                </td>
                                            </tr>
                                        ))}

                                        {files.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-xs text-[#57606a]">
                                                    No files found in the current directory.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right Sidebar (1 column) */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* About */}
                            <div className="space-y-3 pb-5 border-b border-[#d0d7de]">
                                <h3 className="text-sm font-semibold text-[#1f2328]">About</h3>
                                <p className="text-xs text-[#57606a] leading-relaxed">
                                    {repoInfo?.description || 'No description, website, or topics provided.'}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs text-[#57606a]">
                                    <Tag className="w-3.5 h-3.5" />
                                    <span>Readme</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-[#57606a]">
                                    <History className="w-3.5 h-3.5" />
                                    <span>Activity</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-[#57606a]">
                                    <Star className="w-3.5 h-3.5" />
                                    <span>{starCount} stars</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-[#57606a]">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>1 watching</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-[#57606a]">
                                    <GitFork className="w-3.5 h-3.5" />
                                    <span>0 forks</span>
                                </div>
                            </div>

                            {/* Releases */}
                            <div className="space-y-2 pb-5 border-b border-[#d0d7de]">
                                <h3 className="text-sm font-semibold text-[#1f2328]">Releases</h3>
                                <p className="text-xs text-[#57606a]">No releases published</p>
                            </div>

                            {/* Packages */}
                            <div className="space-y-2 pb-5 border-b border-[#d0d7de]">
                                <h3 className="text-sm font-semibold text-[#1f2328]">Packages</h3>
                                <p className="text-xs text-[#57606a]">No packages published</p>
                            </div>

                            {/* Contributors */}
                            <div className="space-y-3 pb-5 border-b border-[#d0d7de]">
                                <h3 className="text-sm font-semibold text-[#1f2328]">
                                    Contributors <span className="ml-1 text-xs font-normal text-[#57606a]">{contributors.length}</span>
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {contributors.map((c, i) => (
                                        <div 
                                            key={i} 
                                            title={c}
                                            className="w-7 h-7 rounded-full bg-[#d0d7de] text-[#24292f] border border-white flex items-center justify-center font-semibold text-xs shadow-sm"
                                        >
                                            {c.charAt(0).toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Languages */}
                            {languageBreakdown && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-[#1f2328]">Languages</h3>
                                    <div className="w-full h-2 rounded-full flex overflow-hidden">
                                        {languageBreakdown.map(l => (
                                            <div 
                                                key={l.lang} 
                                                className={`h-full ${l.color}`} 
                                                style={{ width: `${l.percentage}%` }}
                                                title={`${l.lang} ${l.percentage}%`}
                                            ></div>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#57606a]">
                                        {languageBreakdown.map(l => (
                                            <div key={l.lang} className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${l.color}`}></div>
                                                <span className="font-medium text-[#1f2328]">{l.lang}</span>
                                                <span>{l.percentage}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RepositoryView;
