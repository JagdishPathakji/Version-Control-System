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
    Terminal,
    Users,
    UserPlus,
    Trash2,
    Crown,
    Clock,
    ShieldAlert,
    ShieldCheck,
    AlertTriangle,
    RefreshCw,
    KeyRound,
    FileCode
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

    // Contributor management states
    const [contributorsList, setContributorsList] = useState<any[]>([]);
    const [pendingContributors, setPendingContributors] = useState<any[]>([]);
    const [isOwner, setIsOwner] = useState(false);
    const [isContributor, setIsContributor] = useState(false);
    const [hasPendingInvite, setHasPendingInvite] = useState(false);
    const [inviteUsername, setInviteUsername] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteMsg, setInviteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [declineLoading, setDeclineLoading] = useState(false);

    // Security scanner states
    const [securityReport, setSecurityReport] = useState<any>(null);
    const [securityLoading, setSecurityLoading] = useState(false);
    const [securitySeverityFilter, setSecuritySeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
    const [hasScannedSecurity, setHasScannedSecurity] = useState(false);

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

    const handleDownloadZip = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsDownloading(true);
        try {
            const downloadUrl = `https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/zip?branch=${selectedBranch}${targetOid ? `&oid=${targetOid}` : ''}`;
            const res = await fetch(downloadUrl, { credentials: 'include' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || `Download failed (${res.status})`);
            }
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${repoName}-${selectedBranch}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (err: any) {
            console.error('Download ZIP error:', err);
            alert(err.message || 'Failed to download ZIP archive');
        } finally {
            setIsDownloading(false);
        }
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

    const fetchContributors = async () => {
        try {
            const res = await fetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/contributors`, { credentials: 'include' });
            const data = await res.json();
            if (data.status) {
                setContributorsList(data.contributors || []);
                setPendingContributors(data.pendingContributors || []);
                setIsOwner(Boolean(data.isOwner));
                setIsContributor(Boolean(data.isContributor));
                setHasPendingInvite(Boolean(data.hasPendingInvite));
            }
        } catch (err) {
            console.error("Error loading contributors:", err);
        }
    };

    const handleInviteContributor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteUsername.trim()) return;
        setInviteLoading(true);
        setInviteMsg(null);
        try {
            const res = await fetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/contributors/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: inviteUsername.trim() }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.status) {
                setInviteMsg({ type: 'success', text: data.message });
                setInviteUsername('');
                fetchContributors();
            } else {
                setInviteMsg({ type: 'error', text: data.message || 'Failed to send invitation' });
            }
        } catch (err: any) {
            setInviteMsg({ type: 'error', text: err.message || 'Error sending invitation' });
        } finally {
            setInviteLoading(false);
        }
    };

    const handleAcceptInvite = async () => {
        setAcceptLoading(true);
        try {
            const res = await fetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/contributors/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await res.json();
            if (data.status) {
                setHasPendingInvite(false);
                setIsContributor(true);
                alert(data.message);
                fetchContributors();
                clearCache(`/repo/${username}/${repoName}`);
            } else {
                alert(data.message || 'Failed to accept invitation');
            }
        } catch (err: any) {
            alert(err.message || 'Error accepting invitation');
        } finally {
            setAcceptLoading(false);
        }
    };

    const handleDeclineInvite = async () => {
        if (!confirm('Are you sure you want to decline this invitation?')) return;
        setDeclineLoading(true);
        try {
            const res = await fetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/contributors/decline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await res.json();
            if (data.status) {
                setHasPendingInvite(false);
                fetchContributors();
            } else {
                alert(data.message || 'Failed to decline invitation');
            }
        } catch (err: any) {
            alert(err.message || 'Error declining invitation');
        } finally {
            setDeclineLoading(false);
        }
    };

    const handleRemoveContributor = async (targetUsername: string) => {
        const isSelf = targetUsername.toLowerCase() === localStorage.getItem("username")?.toLowerCase();
        if (!confirm(isSelf ? `Are you sure you want to leave this repository?` : `Remove @${targetUsername} as contributor?`)) return;
        try {
            const res = await fetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/contributors/${targetUsername}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.status) {
                fetchContributors();
                clearCache(`/repo/${username}/${repoName}`);
                if (isSelf) {
                    setIsContributor(false);
                }
            } else {
                alert(data.message || 'Failed to remove contributor');
            }
        } catch (err: any) {
            alert(err.message || 'Error removing contributor');
        }
    };

    const runSecurityScan = async (targetBranch?: string) => {
        setSecurityLoading(true);
        try {
            const b = targetBranch || selectedBranch || 'master';
            const res = await fetch(`https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/security/scan?branch=${b}`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (data.status) {
                setSecurityReport(data.report);
                setHasScannedSecurity(true);
            } else {
                alert(data.message || 'Failed to complete security scan');
            }
        } catch (err: any) {
            console.error('Security scan error:', err);
            alert(err.message || 'Error running security scan');
        } finally {
            setSecurityLoading(false);
        }
    };

    const handleSwitchToSecurity = () => {
        setActiveTab('security');
        if (!hasScannedSecurity) {
            runSecurityScan();
        }
    };

    useEffect(() => {
        fetchContributors();
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

    const initSnippet = `girgit init\ngirgit commit -m "first commit"\ngirgit remote add origin ${s3Url}\ngirgit push origin master`;
    const pushSnippet = `girgit remote add origin ${s3Url}\ngirgit push origin master`;

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
                            onClick={handleSwitchToSecurity}
                            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'security' 
                                    ? 'border-[#fd8c73] text-[#1f2328] font-semibold' 
                                    : 'border-transparent text-[#57606a] hover:text-[#1f2328] hover:border-[#d0d7de]'
                            }`}
                        >
                            <Shield className="w-4 h-4" />
                            <span>Security</span>
                            {securityReport && securityReport.totalFindings > 0 && (
                                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] bg-[#cf222e] text-white rounded-full font-bold">
                                    {securityReport.totalFindings}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('collaborators')}
                            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'collaborators' 
                                    ? 'border-[#fd8c73] text-[#1f2328] font-semibold' 
                                    : 'border-transparent text-[#57606a] hover:text-[#1f2328] hover:border-[#d0d7de]'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>Collaborators</span>
                            <span className="ml-0.5 px-1.5 py-0.2 text-xs bg-[#afb8c1]/20 rounded-full font-normal">
                                {contributorsList.length + 1}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Page Area */}
            <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {/* Pending Invitation Banner for the Current User */}
                {hasPendingInvite && (
                    <div className="mb-6 bg-[#dafbe1] border border-[#4ac26b]/50 rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#1f883d] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-[#1a7f37]">Collaboration Invitation Received</h4>
                                <p className="text-xs text-[#1f2328] mt-0.5">
                                    <strong>@{username}</strong> has invited you to be a contributor to <strong>{username}/{repoName}</strong>. As an accepted contributor, you can push code and branches directly to this repository!
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleAcceptInvite}
                                disabled={acceptLoading}
                                className="px-3.5 py-1.5 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>{acceptLoading ? 'Accepting...' : 'Accept Invitation'}</span>
                            </button>
                            <button
                                onClick={handleDeclineInvite}
                                disabled={declineLoading}
                                className="px-3.5 py-1.5 bg-white border border-[#d0d7de] hover:bg-[#f6f8fa] text-[#cf222e] text-xs font-semibold rounded-md shadow-sm transition-colors disabled:opacity-50"
                            >
                                {declineLoading ? 'Declining...' : 'Decline'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'collaborators' ? (
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#d0d7de] gap-2">
                            <div>
                                <h2 className="text-xl font-semibold text-[#1f2328] flex items-center gap-2">
                                    <Users className="w-5 h-5 text-[#0969da]" />
                                    Repository Collaborators
                                </h2>
                                <p className="text-xs text-[#57606a] mt-1">
                                    Manage people with push access to this repository. Owners and contributors can push code, create branches, and merge.
                                </p>
                            </div>
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#ddf4ff] text-[#0969da] border border-[#54aeff]/40 w-fit">
                                {contributorsList.length + 1} Active Member{contributorsList.length + 1 > 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Owner Add Contributor Form */}
                        {isOwner && (
                            <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-sm">
                                <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-3">
                                    <h3 className="text-sm font-semibold text-[#1f2328] flex items-center gap-2">
                                        <UserPlus className="w-4 h-4 text-[#1a7f37]" />
                                        Add a Contributor
                                    </h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    <p className="text-xs text-[#57606a]">
                                        Invite developers by their username. Once they accept the invitation received on their dashboard, they will have write access to push commits and branches.
                                    </p>
                                    <form onSubmit={handleInviteContributor} className="flex flex-col sm:flex-row gap-2 max-w-lg">
                                        <input
                                            type="text"
                                            placeholder="Enter collaborator username (e.g. alice)"
                                            value={inviteUsername}
                                            onChange={(e) => setInviteUsername(e.target.value)}
                                            className="flex-1 bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-3 py-1.5 text-xs text-[#1f2328] placeholder-[#57606a] focus:outline-none focus:border-[#0969da] focus:bg-white transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            disabled={inviteLoading || !inviteUsername.trim()}
                                            className="px-4 py-1.5 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            {inviteLoading ? <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <UserPlus className="w-3.5 h-3.5" />}
                                            <span>Invite Contributor</span>
                                        </button>
                                    </form>
                                    {inviteMsg && (
                                        <div className={`text-xs px-3 py-2 rounded-md ${inviteMsg.type === 'success' ? 'bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b]/30' : 'bg-[#ffebe9] text-[#cf222e] border border-[#ff8182]/30'}`}>
                                            {inviteMsg.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pending Invitations Box (Owner Only) */}
                        {isOwner && pendingContributors.length > 0 && (
                            <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-sm">
                                <div className="bg-[#fff8c5]/40 border-b border-[#d0d7de] px-4 py-2.5 flex items-center justify-between">
                                    <h3 className="text-xs font-semibold text-[#9a6700] flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        Pending Invitations ({pendingContributors.length})
                                    </h3>
                                </div>
                                <ul className="divide-y divide-[#d0d7de]">
                                    {pendingContributors.map((p, idx) => (
                                        <li key={idx} className="p-3.5 flex items-center justify-between hover:bg-[#f6f8fa] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#eaeef2] text-[#57606a] flex items-center justify-center font-bold text-xs border border-[#d0d7de]">
                                                    {p.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-[#1f2328]">@{p.username}</span>
                                                    <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-[#fff8c5] text-[#9a6700] border border-[#d4a72c]/40 rounded-full font-medium">
                                                        Invitation Pending
                                                    </span>
                                                    <p className="text-[11px] text-[#57606a] mt-0.5">
                                                        Invited {formatTimeAgo(p.invitedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveContributor(p.username)}
                                                className="text-xs text-[#cf222e] hover:underline font-medium px-2 py-1"
                                            >
                                                Cancel Invitation
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Active Members List */}
                        <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-sm">
                            <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-2.5 flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-[#1f2328]">
                                    People with push access ({contributorsList.length + 1})
                                </h3>
                            </div>
                            <ul className="divide-y divide-[#d0d7de]">
                                {/* Repository Owner Entry */}
                                <li className="p-3.5 flex items-center justify-between hover:bg-[#f6f8fa] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-[#1f883d] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                            {username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Link to={`/publicProfile/${username}`} className="text-xs font-semibold text-[#0969da] hover:underline">
                                                    @{username}
                                                </Link>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-[#ddf4ff] text-[#0969da] border border-[#54aeff]/40 rounded-full">
                                                    <Crown className="w-3 h-3 text-[#0969da]" />
                                                    Owner
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-[#57606a] mt-0.5">Has administrative and full write privileges</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-[#57606a] font-medium">Repository Owner</span>
                                </li>

                                {/* Contributors Entries */}
                                {contributorsList.map((c, idx) => (
                                    <li key={idx} className="p-3.5 flex items-center justify-between hover:bg-[#f6f8fa] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#0969da] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                {c.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Link to={`/publicProfile/${c.username}`} className="text-xs font-semibold text-[#0969da] hover:underline">
                                                        @{c.username}
                                                    </Link>
                                                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b]/40 rounded-full">
                                                        Contributor
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-[#57606a] mt-0.5">
                                                    Can push commits and create branches &bull; Joined {formatTimeAgo(c.acceptedAt || c.invitedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        {(isOwner || c.username.toLowerCase() === localStorage.getItem("username")?.toLowerCase()) && (
                                            <button
                                                onClick={() => handleRemoveContributor(c.username)}
                                                className="flex items-center gap-1 text-xs text-[#cf222e] hover:bg-[#ffebe9] px-2.5 py-1 rounded border border-transparent hover:border-[#ff8182]/40 transition-colors font-medium"
                                                title={c.username.toLowerCase() === localStorage.getItem("username")?.toLowerCase() ? "Leave repository" : "Remove contributor"}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>{c.username.toLowerCase() === localStorage.getItem("username")?.toLowerCase() ? "Leave" : "Remove"}</span>
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : activeTab === 'security' ? (
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#d0d7de] gap-3">
                            <div>
                                <h2 className="text-xl font-semibold text-[#1f2328] flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-[#1a7f37]" />
                                    Secret & Credential Leak Scanner
                                </h2>
                                <p className="text-xs text-[#57606a] mt-1">
                                    Automated static security analysis inspecting all files and blob objects in branch <span className="font-mono font-semibold text-[#1f2328] bg-[#eaeef2] px-1.5 py-0.5 rounded">refs/heads/{selectedBranch}</span> for leaked secrets.
                                </p>
                            </div>
                            <button
                                onClick={() => runSecurityScan()}
                                disabled={securityLoading}
                                className="px-3.5 py-1.5 bg-[#0969da] hover:bg-[#085ac1] text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${securityLoading ? 'animate-spin' : ''}`} />
                                <span>{securityLoading ? 'Scanning Tree...' : 'Run Security Scan'}</span>
                            </button>
                        </div>

                        {/* Loading State */}
                        {securityLoading && (
                            <div className="border border-[#d0d7de] rounded-md bg-white p-12 text-center text-[#57606a] shadow-sm">
                                <div className="inline-block w-8 h-8 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin"></div>
                                <h4 className="text-sm font-semibold text-[#1f2328] mt-3">Analyzing repository commit tree...</h4>
                                <p className="text-xs text-[#57606a] mt-1">Evaluating 10 secret patterns against all file blobs.</p>
                            </div>
                        )}

                        {/* Result View */}
                        {!securityLoading && securityReport && (
                            <>
                                {/* Health Status Overview Banner */}
                                {securityReport.healthStatus === 'CLEAN' ? (
                                    <div className="border border-[#4ac26b]/50 bg-[#dafbe1]/40 rounded-md p-5 flex items-start gap-4 shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-[#1f883d] text-white flex items-center justify-center shrink-0 shadow-sm">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold text-[#1a7f37]">
                                                Clean Repository — No Exposed Credentials Found
                                            </h3>
                                            <p className="text-xs text-[#1f2328] mt-1 leading-relaxed">
                                                Girgit scanned <strong>{securityReport.totalFilesScanned} file{securityReport.totalFilesScanned === 1 ? '' : 's'}</strong> in <strong>{securityReport.durationMs}ms</strong> across {securityReport.rulesCount} security detection rules. No AWS keys, private certificates, database URIs, or API tokens were found.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border border-[#ff8182]/60 bg-[#ffebe9] rounded-md p-5 flex items-start gap-4 shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-[#cf222e] text-white flex items-center justify-center shrink-0 shadow-sm">
                                            <ShieldAlert className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold text-[#cf222e]">
                                                Security Alert: {securityReport.totalFindings} Leaked Credential{securityReport.totalFindings === 1 ? '' : 's'} Detected!
                                            </h3>
                                            <p className="text-xs text-[#1f2328] mt-1 leading-relaxed">
                                                Exposed credentials were discovered in your committed files. We recommend immediately revoking and rotating these credentials to prevent unauthorized access to your cloud infrastructure.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Metrics Grid (4 Cards) */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="border border-[#d0d7de] rounded-md bg-white p-3.5 shadow-sm">
                                        <span className="text-[11px] font-medium text-[#57606a]">Files Analyzed</span>
                                        <div className="text-xl font-bold text-[#1f2328] mt-1">{securityReport.totalFilesScanned}</div>
                                    </div>
                                    <div className="border border-[#d0d7de] rounded-md bg-white p-3.5 shadow-sm">
                                        <span className="text-[11px] font-medium text-[#cf222e]">Critical Severity</span>
                                        <div className="text-xl font-bold text-[#cf222e] mt-1">{securityReport.criticalCount}</div>
                                    </div>
                                    <div className="border border-[#d0d7de] rounded-md bg-white p-3.5 shadow-sm">
                                        <span className="text-[11px] font-medium text-[#9a6700]">High / Medium</span>
                                        <div className="text-xl font-bold text-[#9a6700] mt-1">{securityReport.highCount + securityReport.mediumCount}</div>
                                    </div>
                                    <div className="border border-[#d0d7de] rounded-md bg-white p-3.5 shadow-sm">
                                        <span className="text-[11px] font-medium text-[#57606a]">Scan Latency</span>
                                        <div className="text-xl font-bold text-[#1f2328] mt-1">{securityReport.durationMs} ms</div>
                                    </div>
                                </div>

                                {/* Findings List Section */}
                                <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-sm">
                                    <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <h3 className="text-xs font-semibold text-[#1f2328] flex items-center gap-2">
                                            <KeyRound className="w-4 h-4 text-[#57606a]" />
                                            Secret Scan Findings ({
                                                (securityReport.findings || []).filter((f: any) => securitySeverityFilter === 'ALL' || f.severity === securitySeverityFilter).length
                                            })
                                        </h3>
                                        {/* Severity Filter Tabs */}
                                        <div className="flex items-center gap-1 text-[11px]">
                                            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(sev => (
                                                <button
                                                    key={sev}
                                                    onClick={() => setSecuritySeverityFilter(sev)}
                                                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                                                        securitySeverityFilter === sev 
                                                            ? 'bg-[#eaeef2] text-[#1f2328] font-bold' 
                                                            : 'text-[#57606a] hover:text-[#1f2328]'
                                                    }`}
                                                >
                                                    {sev}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {(securityReport.findings || []).filter((f: any) => securitySeverityFilter === 'ALL' || f.severity === securitySeverityFilter).length === 0 ? (
                                        <div className="p-8 text-center text-xs text-[#57606a]">
                                            <ShieldCheck className="w-8 h-8 text-[#1a7f37] mx-auto mb-2" />
                                            No findings match the selected filter.
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-[#d0d7de]">
                                            {(securityReport.findings || [])
                                                .filter((f: any) => securitySeverityFilter === 'ALL' || f.severity === securitySeverityFilter)
                                                .map((finding: any) => (
                                                    <li key={finding.id} className="p-4 space-y-2 hover:bg-[#f6f8fa] transition-colors">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full text-white ${
                                                                    finding.severity === 'CRITICAL' ? 'bg-[#cf222e]' :
                                                                    finding.severity === 'HIGH' ? 'bg-[#d4a72c]' : 'bg-[#0969da]'
                                                                }`}>
                                                                    {finding.severity}
                                                                </span>
                                                                <span className="text-xs font-semibold text-[#1f2328]">{finding.ruleName}</span>
                                                            </div>
                                                            <Link 
                                                                to={`/repo/${username}/${repoName}/blob/${selectedBranch}/${finding.filePath}`}
                                                                className="text-xs font-mono text-[#0969da] hover:underline flex items-center gap-1"
                                                            >
                                                                <FileCode className="w-3.5 h-3.5" />
                                                                <span>{finding.filePath}:{finding.lineNumber}</span>
                                                            </Link>
                                                        </div>

                                                        {/* Masked Secret Preview */}
                                                        <div className="flex items-center justify-between bg-[#24292f] text-white px-3 py-1.5 rounded font-mono text-xs overflow-x-auto">
                                                            <code>{finding.maskedSnippet}</code>
                                                            <span className="text-[10px] text-[#8c959f] ml-2 shrink-0">Redacted for security</span>
                                                        </div>

                                                        <p className="text-xs text-[#57606a] leading-relaxed">
                                                            {finding.description}
                                                        </p>

                                                        {/* Remediation Box */}
                                                        <div className="text-xs bg-[#f6f8fa] border border-[#d0d7de] rounded p-2 text-[#24292f] flex items-start gap-2">
                                                            <AlertTriangle className="w-4 h-4 text-[#9a6700] shrink-0 mt-0.5" />
                                                            <div>
                                                                <span className="font-semibold text-[#1f2328]">Remediation: </span>
                                                                <span className="text-[#57606a]">{finding.remediation}</span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Security Rules Engine Overview */}
                                <div className="border border-[#d0d7de] rounded-md bg-white p-4 shadow-sm text-xs text-[#57606a] space-y-2">
                                    <h4 className="font-semibold text-[#1f2328] flex items-center gap-1.5">
                                        <Shield className="w-4 h-4 text-[#0969da]" />
                                        Active Secret Detection Signatures ({securityReport.rulesCount}/{securityReport.rulesCount} Enabled)
                                    </h4>
                                    <p className="text-[11px] leading-relaxed">
                                        Girgit scans for AWS IAM Access & Secret Keys, Private RSA/SSH Keys, MongoDB Atlas & Generic Database URIs, GitHub Tokens, Stripe API Secret Keys, Slack Bot Tokens & Webhooks, Google Cloud Keys, and Hardcoded JWT Session Secrets.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                ) : activeTab !== 'code' ? (
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
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-[#1f2328] flex items-center gap-1">
                                        Contributors <span className="ml-1 text-xs font-normal text-[#57606a]">{contributorsList.length + 1}</span>
                                    </h3>
                                    {isOwner && (
                                        <button
                                            onClick={() => setActiveTab('collaborators')}
                                            className="text-xs text-[#0969da] hover:underline font-medium"
                                        >
                                            + Add
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {/* Owner Avatar */}
                                    <Link 
                                        to={`/publicProfile/${username}`}
                                        title={`@${username} (Owner)`}
                                    >
                                        <div className="w-7 h-7 rounded-full bg-[#1f883d] text-white border border-white flex items-center justify-center font-semibold text-xs shadow-sm hover:ring-2 hover:ring-[#0969da] transition-all">
                                            {username?.charAt(0).toUpperCase()}
                                        </div>
                                    </Link>
                                    {/* Contributor Avatars */}
                                    {contributorsList.map((c, i) => (
                                        <Link 
                                            key={i} 
                                            to={`/publicProfile/${c.username}`}
                                            title={`@${c.username} (Contributor)`}
                                        >
                                            <div className="w-7 h-7 rounded-full bg-[#0969da] text-white border border-white flex items-center justify-center font-semibold text-xs shadow-sm hover:ring-2 hover:ring-[#0969da] transition-all">
                                                {c.username?.charAt(0).toUpperCase()}
                                            </div>
                                        </Link>
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
