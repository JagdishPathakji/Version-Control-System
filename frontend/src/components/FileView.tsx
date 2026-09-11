import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cachedFetch } from '../utils/apiCache';
import { 
    GitBranch, 
    Copy, 
    Check, 
    BookOpen, 
    FileText, 
    Code2, 
    FileCode
} from 'lucide-react';

const FileView = () => {
    const { username, repoName, branch } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Parse filePath from splat route
    const filePath = location.pathname.split(`/blob/${branch}/`)[1] || '';
    
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [isRaw, setIsRaw] = useState(false);

    // If passed via state from repo view
    const stateOid = location.state?.oid;

    useEffect(() => {
        let isMounted = true;

        const loadFileContent = async () => {
            setLoading(true);
            setError('');
            try {
                let fileOid = stateOid;

                // Path resolver: If OID was not passed in location.state (e.g. page refresh / direct link)
                if (!fileOid) {
                    const filesRes = await cachedFetch(
                        `https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/files?branch=${branch || 'master'}`, 
                        { credentials: 'include' }
                    );

                    if (filesRes.status && Array.isArray(filesRes.files)) {
                        const matched = filesRes.files.find((f: any) => f.name === filePath || f.name.endsWith('/' + filePath));
                        if (matched && matched.oid) {
                            fileOid = matched.oid;
                        }
                    }
                }

                if (!fileOid) {
                    throw new Error(`Could not resolve file "${filePath}" on branch "${branch}".`);
                }

                const data = await cachedFetch(
                    `https://version-control-system-mebn.onrender.com/repo/${username}/${repoName}/blob/${fileOid}`, 
                    { credentials: 'include' }
                );

                if (!data.status) throw new Error(data.message || 'Failed to load file blob');
                if (isMounted) {
                    setContent(data.content || '');
                }
            } catch (err: any) {
                if (isMounted) setError(err.message || 'Failed to load file');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadFileContent();

        return () => {
            isMounted = false;
        };
    }, [username, repoName, branch, filePath, stateOid]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Calculate file stats
    const lines = content ? content.split('\n') : [];
    const lineCount = lines.length;
    const locCount = lines.filter(l => l.trim().length > 0).length;
    const fileSizeInBytes = new Blob([content]).size;
    const fileSizeFormatted = fileSizeInBytes > 1024 
        ? `${(fileSizeInBytes / 1024).toFixed(1)} KB` 
        : `${fileSizeInBytes} Bytes`;

    // Path segments for breadcrumb
    const pathParts = filePath.split('/');
    const fileName = pathParts[pathParts.length - 1];

    if (loading) return (
        <div className="min-h-screen bg-[#f6f8fa] flex flex-col items-center justify-center">
            <div className="inline-block w-8 h-8 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-[#57606a]">Loading file...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-md shadow-sm border border-[#d0d7de] max-w-md w-full">
                <h2 className="text-base font-semibold text-[#cf222e] mb-2">File not found</h2>
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
                        <Link to={`/publicProfile/${username}`} className="text-[#0969da] hover:underline">
                            {username}
                        </Link>
                        <span className="text-[#57606a]">/</span>
                        <Link to={`/repo/${username}/${repoName}`} className="text-[#0969da] hover:underline font-semibold">
                            {repoName}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {/* Secondary navigation & branch info */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center flex-wrap gap-2 text-sm">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f6f8fa] border border-[#d0d7de] rounded-md text-xs font-semibold text-[#24292f]">
                            <GitBranch className="w-3.5 h-3.5 text-[#57606a]" />
                            <span>{branch}</span>
                        </div>
                        <span className="text-[#57606a]">/</span>
                        <Link to={`/repo/${username}/${repoName}`} className="text-[#0969da] hover:underline text-xs font-medium">
                            {repoName}
                        </Link>
                        {pathParts.map((part, index) => (
                            <React.Fragment key={index}>
                                <span className="text-[#57606a]">/</span>
                                <span className={index === pathParts.length - 1 ? 'font-semibold text-[#1f2328] text-xs' : 'text-[#0969da] text-xs'}>
                                    {part}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* File Viewer Box */}
                <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-sm">
                    {/* GitHub File Toolbar */}
                    <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-[#57606a] font-medium">
                            <FileText className="w-4 h-4 text-[#57606a]" />
                            <span>{lineCount} lines ({locCount} loc)</span>
                            <span>&middot;</span>
                            <span>{fileSizeFormatted}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* Raw Button */}
                            <button
                                onClick={() => setIsRaw(!isRaw)}
                                className={`px-2.5 py-1 border border-[#d0d7de] rounded-md text-xs font-medium transition-colors ${
                                    isRaw 
                                        ? 'bg-[#24292f] text-white border-[#24292f]' 
                                        : 'bg-white hover:bg-[#f3f4f6] text-[#24292f]'
                                }`}
                            >
                                {isRaw ? 'Rendered' : 'Raw'}
                            </button>

                            {/* Copy File Content Button */}
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#f3f4f6] border border-[#d0d7de] rounded-md text-xs font-medium text-[#24292f] transition-colors"
                                title="Copy raw contents"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-[#1a7f37]" /> : <Copy className="w-3.5 h-3.5 text-[#57606a]" />}
                                <span>{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                    </div>

                    {/* File Content Body */}
                    <div className="p-0 bg-white overflow-x-auto">
                        {isRaw ? (
                            <pre className="p-4 text-xs font-mono text-[#24292f] whitespace-pre overflow-x-auto bg-white">
                                {content}
                            </pre>
                        ) : fileName.toLowerCase().endsWith('.md') ? (
                            <div className="p-8 prose max-w-none text-[#1f2328] bg-white">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({ node, inline, className, children, ...props }: any) {
                                            const match = /language-(\w+)/.exec(className || "");
                                            return !inline && match ? (
                                                <SyntaxHighlighter
                                                    style={oneDark}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, "")}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code className="bg-[#afb8c1]/20 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <SyntaxHighlighter
                                style={oneDark}
                                language={
                                    (() => {
                                        const ext = fileName.split('.').pop()?.toLowerCase();
                                        switch (ext) {
                                            case 'js': case 'jsx': return 'javascript';
                                            case 'ts': case 'tsx': return 'typescript';
                                            case 'py': return 'python';
                                            case 'json': return 'json';
                                            case 'html': return 'html';
                                            case 'css': return 'css';
                                            case 'sh': case 'bash': return 'bash';
                                            case 'yml': case 'yaml': return 'yaml';
                                            case 'java': return 'java';
                                            case 'c': case 'cpp': return 'cpp';
                                            case 'go': return 'go';
                                            case 'rs': return 'rust';
                                            default: return 'text';
                                        }
                                    })()
                                }
                                showLineNumbers={true}
                                lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#6e7681', textAlign: 'right' }}
                                PreTag="div"
                                customStyle={{ margin: 0, padding: '1.25rem 0.5rem', fontSize: '0.8125rem' }}
                            >
                                {content}
                            </SyntaxHighlighter>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileView;
