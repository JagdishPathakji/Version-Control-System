import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import { cachedFetch, clearCache } from "../utils/apiCache";
import { 
    BookOpen, 
    Lock, 
    Globe, 
    Search, 
    Plus, 
    Users, 
    Sparkles, 
    Activity, 
    Book, 
    X, 
    Terminal, 
    Check, 
    Copy,
    ChevronRight,
    ExternalLink
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getAllProfile from "../functionalities/getAllProfile";

export default function Dashboard({ setIsAuthenticated }: { setIsAuthenticated?: (val: boolean) => void }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Developer";
  const [repos, setRepos] = useState<any[]>([]);
  const [repoFilter, setRepoFilter] = useState("");
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<"cli" | "s3" | "workflow">("cli");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Follow tracking state for community cards
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    cachedFetch('https://version-control-system-mebn.onrender.com/user/repos', { credentials: 'include' })
      .then(data => {
        if (data.status) setRepos(data.repos || []);
      })
      .catch(console.error);
  }, []);

  const { data: profilesRes, isLoading } = useQuery({
    queryKey: ["publicProfiles"],
    queryFn: getAllProfile,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const profiles = Array.isArray(profilesRes?.data) ? profilesRes.data : [];

  // Populate follow states from backend
  useEffect(() => {
    if (Array.isArray(profilesRes?.data)) {
      const initial: Record<string, boolean> = {};
      profilesRes.data.forEach((p: any) => {
        initial[p.username] = Boolean(p.isFollowing);
      });
      setFollowingMap(prev => ({ ...initial, ...prev }));
    }
  }, [profilesRes]);

  const handleToggleFollow = async (targetUsername: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = Boolean(followingMap[targetUsername]);
    
    // Optimistic UI update
    setFollowingMap(prev => ({ ...prev, [targetUsername]: !currentStatus }));
    setFollowLoading(prev => ({ ...prev, [targetUsername]: true }));

    try {
      const res = await fetch(`https://version-control-system-mebn.onrender.com/follower/${targetUsername}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const data = await res.json();
      
      if (data && data.status) {
        clearCache(`getPublicProfile/${targetUsername}`);
        clearCache("getAllUsers");
        const newStatus = typeof data.isFollowing === 'boolean' ? data.isFollowing : Boolean(data.followstatus);
        setFollowingMap(prev => ({ ...prev, [targetUsername]: newStatus }));
      } else {
        // Revert on failure
        setFollowingMap(prev => ({ ...prev, [targetUsername]: currentStatus }));
        alert(data?.message || "Failed to update follow status");
      }
    } catch (err: any) {
      setFollowingMap(prev => ({ ...prev, [targetUsername]: currentStatus }));
      alert("Error updating follow status: " + err.message);
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUsername]: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const filteredRepos = repos.filter(r => 
    r.name.toLowerCase().includes(repoFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col">
      <Navbar
        username={username}
        setIsAuthenticated={setIsAuthenticated}
        navigate={navigate}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ---- LEFT COLUMN: TOP REPOSITORIES ---- */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-[#d0d7de] rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-sm font-semibold text-[#1f2328]">Top Repositories</h2>
              <button 
                onClick={() => navigate('/repo/new')}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {/* Quick Filter Input */}
            <div className="relative mb-3">
              <input 
                type="text"
                value={repoFilter}
                onChange={(e) => setRepoFilter(e.target.value)}
                placeholder="Find a repository..."
                className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md pl-7 pr-3 py-1 text-xs text-[#1f2328] placeholder-[#57606a] focus:outline-none focus:border-[#0969da] focus:bg-white transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-[#57606a] absolute left-2.5 top-1.5" />
            </div>

            {/* Repositories List */}
            {filteredRepos.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#57606a]">
                {repos.length === 0 ? "You don't have any repositories yet." : "No repositories match your filter."}
              </div>
            ) : (
              <ul className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {filteredRepos.map((repo: any) => (
                  <li key={repo._id}>
                    <div 
                      onClick={() => navigate(`/repo/${username}/${repo.name}`)}
                      className="group flex items-center justify-between p-1.5 rounded hover:bg-[#f6f8fa] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-4 h-4 rounded-full bg-[#d0d7de] text-[#24292f] flex items-center justify-center font-semibold text-[9px] shrink-0">
                          {username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-[#1f2328] group-hover:text-[#0969da] group-hover:underline truncate">
                          {username}/{repo.name}
                        </span>
                      </div>
                      {repo.isPrivate ? (
                        <Lock className="w-3 h-3 text-[#57606a] shrink-0" />
                      ) : (
                        <Globe className="w-3 h-3 text-[#57606a] shrink-0" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="border border-[#d0d7de] rounded-md bg-white p-3 text-xs text-[#57606a] space-y-2">
            <div className="font-semibold text-[#1f2328] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#0969da]" />
              <span>Quick Links</span>
            </div>
            <div className="flex flex-col space-y-1">
              <Link to="/profile" className="text-[#0969da] hover:underline">Your Profile</Link>
              <Link to="/repo/new" className="text-[#0969da] hover:underline">New Repository</Link>
              <button 
                onClick={() => setShowDocsModal(true)} 
                className="text-left text-[#0969da] hover:underline"
              >
                Girgit Documentation
              </button>
            </div>
          </div>
        </div>

        {/* ---- CENTER COLUMN: ACTIVITY FEED & DEVELOPERS ---- */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#d0d7de] pb-2">
            <h1 className="text-base font-semibold text-[#1f2328]">Home</h1>
            <span className="text-xs text-[#57606a]">Community Activity</span>
          </div>

          {/* User's recent repository activity notice */}
          {repos.length > 0 && (
            <div className="border border-[#d0d7de] rounded-md bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1f2328] mb-2">
                <BookOpen className="w-4 h-4 text-[#0969da]" />
                <span>Your Latest Repository</span>
              </div>
              <div className="flex items-center justify-between bg-[#f6f8fa] border border-[#d0d7de] rounded p-3 text-xs">
                <div>
                  <Link to={`/repo/${username}/${repos[0].name}`} className="font-semibold text-[#0969da] hover:underline text-sm">
                    {username}/{repos[0].name}
                  </Link>
                  {repos[0].description && (
                    <p className="text-[#57606a] mt-1 line-clamp-1">{repos[0].description}</p>
                  )}
                </div>
                <button 
                  onClick={() => navigate(`/repo/${username}/${repos[0].name}`)}
                  className="px-2.5 py-1 text-xs font-medium text-[#24292f] bg-white border border-[#d0d7de] rounded hover:bg-[#eaeef2]"
                >
                  View
                </button>
              </div>
            </div>
          )}

          {/* Discover Developers Card */}
          <div className="border border-[#d0d7de] rounded-md bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-[#d0d7de] pb-2">
              <h2 className="text-sm font-semibold text-[#1f2328] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0969da]" />
                Discover Developers
              </h2>
              <span className="text-xs text-[#57606a]">{profiles.length} developers</span>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-xs text-[#57606a]">
                <div className="inline-block w-6 h-6 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2">Loading community...</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#57606a]">No developers found.</div>
            ) : (
              <div className="divide-y divide-[#d0d7de]/70">
                {profiles.map((profile: any, idx: number) => {
                  const isFollowingThisUser = Boolean(followingMap[profile.username]);
                  const isSelf = profile.username?.toLowerCase() === username?.toLowerCase();

                  return (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div 
                        onClick={() => {
                          if (isSelf) {
                            navigate('/profile');
                          } else {
                            navigate(`/publicProfile/${profile.username}`);
                          }
                        }}
                        className="flex items-center gap-3 cursor-pointer min-w-0"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#d0d7de] text-[#24292f] flex items-center justify-center font-bold text-sm shrink-0">
                          {(profile.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-[#1f2328] hover:text-[#0969da] hover:underline truncate">
                            {profile.username || "Unknown"} {isSelf && <span className="text-[10px] text-[#57606a] font-normal">(you)</span>}
                          </div>
                          <div className="text-[11px] text-[#57606a] truncate">
                            {profile.email}
                          </div>
                        </div>
                      </div>

                      {!isSelf && (
                        <button 
                          onClick={(e) => handleToggleFollow(profile.username, e)}
                          disabled={followLoading[profile.username]}
                          className={`px-3 py-1 border rounded-md text-xs font-semibold transition-all shrink-0 ${
                            isFollowingThisUser 
                              ? 'bg-[#f6f8fa] hover:bg-[#ffebe9] hover:text-[#cf222e] hover:border-[#ff8182] text-[#57606a] border-[#d0d7de]' 
                              : 'bg-[#1f883d] hover:bg-[#1a7f37] text-white border-transparent shadow-xs'
                          } disabled:opacity-50`}
                        >
                          {followLoading[profile.username] ? '...' : isFollowingThisUser ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ---- RIGHT COLUMN: ABOUT & DOCUMENTATION ---- */}
        <div className="lg:col-span-3 space-y-4">
          <div className="border border-[#d0d7de] rounded-md bg-white p-4 shadow-sm text-xs space-y-3">
            <div className="font-semibold text-sm text-[#1f2328] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#e3b341]" />
              <span>About Girgit</span>
            </div>
            <p className="text-[#57606a] leading-relaxed">
              Girgit is a fast, lightweight Git-compatible version control platform backed by high-availability cloud object storage.
            </p>
            <div className="border-t border-[#d0d7de] pt-2">
              <button 
                onClick={() => setShowDocsModal(true)}
                className="text-[#0969da] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Book className="w-3.5 h-3.5" />
                <span>View Girgit Documentation</span>
              </button>
            </div>
          </div>

          {/* CLI Cheatsheet Box */}
          <div className="border border-[#d0d7de] rounded-md bg-white p-4 shadow-sm text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#1f2328]">Girgit CLI</span>
              <button 
                onClick={() => setShowDocsModal(true)}
                className="text-[#0969da] hover:underline text-[11px]"
              >
                Full manual
              </button>
            </div>
            <p className="text-[#57606a]">Quick commands for your terminal:</p>
            <div className="bg-[#f6f8fa] border border-[#d0d7de] rounded p-2.5 font-mono text-[11px] text-[#24292f] space-y-1.5 select-all">
              <div className="text-gray-400"># Start a repository</div>
              <div>girgit init</div>
              <div className="text-gray-400"># Stage & commit</div>
              <div>girgit add .</div>
              <div>girgit commit -m "my commit"</div>
              <div className="text-gray-400"># Push to S3 bucket</div>
              <div>girgit push s3://girgit-project/...</div>
            </div>
          </div>
        </div>

      </div>

      {/* ---- GIRGIT DOCUMENTATION MODAL ---- */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-[#d0d7de] rounded-lg shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#010409] text-white flex items-center justify-center">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1f2328]">Girgit Documentation</h3>
                  <p className="text-xs text-[#57606a]">Complete guide to the Girgit Version Control CLI & Web Platform</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDocsModal(false)}
                className="text-[#57606a] hover:text-[#1f2328] p-1 rounded hover:bg-[#eaeef2] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#d0d7de] bg-white px-6 text-xs font-semibold">
              <button
                onClick={() => setActiveDocTab("cli")}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeDocTab === "cli" ? "border-[#fd8c73] text-[#1f2328]" : "border-transparent text-[#57606a] hover:text-[#1f2328]"
                }`}
              >
                CLI Commands Reference
              </button>
              <button
                onClick={() => setActiveDocTab("s3")}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeDocTab === "s3" ? "border-[#fd8c73] text-[#1f2328]" : "border-transparent text-[#57606a] hover:text-[#1f2328]"
                }`}
              >
                S3 Cloud Remote Architecture
              </button>
              <button
                onClick={() => setActiveDocTab("workflow")}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeDocTab === "workflow" ? "border-[#fd8c73] text-[#1f2328]" : "border-transparent text-[#57606a] hover:text-[#1f2328]"
                }`}
              >
                Web Platform & Workflows
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto text-xs text-[#1f2328] space-y-6">
              {activeDocTab === "cli" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-[#1f2328]">Command Line Interface (girgit)</h4>
                    <p className="text-[#57606a]">
                      Girgit provides a Git-compatible CLI implemented in Python. It directly interfaces with local working trees and cloud S3 buckets without needing an intermediate git server.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { cmd: "girgit init", desc: "Initializes a new Girgit repository in current directory, creating .girgit/ storage." },
                      { cmd: "girgit add <path>", desc: "Stages specific files or all modified files (girgit add .) into the staging index." },
                      { cmd: 'girgit commit -m "<message>"', desc: "Creates a new immutable commit object with author, timestamp, parent pointer, and root tree hash." },
                      { cmd: "girgit log", desc: "Displays chronological commit log with commit hashes, authors, dates, and messages." },
                      { cmd: "girgit status", desc: "Inspects repository working tree status, listing untracked, staged, and modified files." },
                      { cmd: "girgit branch [name]", desc: "Lists all local branches or creates a new branch pointer at current HEAD." },
                      { cmd: "girgit checkout <branch>", desc: "Switches working directory to the target branch and restores tracked files from the tree." },
                      { cmd: "girgit push <s3-url>", desc: "Uploads all missing commits, tree manifests, and blob objects directly to the remote S3 repository." },
                      { cmd: "girgit clone <s3-url>", desc: "Downloads full repository objects from S3 and checks out the master/main branch." },
                      { cmd: "girgit show <oid>", desc: "Pretty-prints the header and contents of any blob, tree, or commit object by SHA hash." },
                    ].map((item, i) => (
                      <div key={i} className="border border-[#d0d7de] rounded-md p-3 bg-[#f6f8fa]">
                        <div className="flex items-center justify-between mb-1">
                          <code className="font-mono font-bold text-[#0969da]">{item.cmd}</code>
                          <button 
                            onClick={() => copyToClipboard(item.cmd)}
                            className="text-[#57606a] hover:text-[#1f2328] p-1 rounded"
                            title="Copy command"
                          >
                            {copiedCmd === item.cmd ? <Check className="w-3.5 h-3.5 text-[#1a7f37]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-[#57606a]">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDocTab === "s3" && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-[#1f2328]">S3 Remote Storage Model</h4>
                  <p className="text-[#57606a] leading-relaxed">
                    Girgit utilizes AWS S3-compatible cloud object storage to deliver serverless, distributed version control:
                  </p>

                  <div className="bg-[#f6f8fa] border border-[#d0d7de] rounded-md p-4 space-y-2 font-mono text-[11px]">
                    <div className="text-gray-500 font-sans font-semibold">Remote URL Specification:</div>
                    <div className="text-[#0969da] font-bold">s3://girgit-project/&lt;username&gt;/&lt;repository-name&gt;</div>
                  </div>

                  <div className="space-y-2 text-[#57606a] leading-relaxed">
                    <p><strong>Bucket Layout:</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><code>&lt;user&gt;/&lt;repo&gt;/objects/&lt;hash&gt;</code>: Content-addressed blobs, trees, and commits.</li>
                      <li><code>&lt;user&gt;/&lt;repo&gt;/refs/heads/&lt;branch&gt;</code>: Branch pointers containing 40-character commit hashes.</li>
                      <li><code>&lt;user&gt;/&lt;repo&gt;/HEAD</code>: Symbolic reference pointing to default branch (refs/heads/master).</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeDocTab === "workflow" && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-[#1f2328]">Web Platform Collaboration</h4>
                  <p className="text-[#57606a] leading-relaxed">
                    The Girgit web platform provides real-time collaboration tools matching GitHub's workflow:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border border-[#d0d7de] rounded-md p-3">
                      <div className="font-semibold text-[#1f2328] mb-1">On-The-Fly ZIP Downloads</div>
                      <p className="text-[#57606a]">Download complete snapshots of any branch or historical commit packaged dynamically via backend streams.</p>
                    </div>

                    <div className="border border-[#d0d7de] rounded-md p-3">
                      <div className="font-semibold text-[#1f2328] mb-1">In-Browser Branch Merging</div>
                      <p className="text-[#57606a]">Merge feature branches into master right from the web UI with automated commit resolution.</p>
                    </div>

                    <div className="border border-[#d0d7de] rounded-md p-3">
                      <div className="font-semibold text-[#1f2328] mb-1">Diff Viewer (Split & Unified)</div>
                      <p className="text-[#57606a]">Compare commit changes with word-level diffing, line count additions, and deletions.</p>
                    </div>

                    <div className="border border-[#d0d7de] rounded-md p-3">
                      <div className="font-semibold text-[#1f2328] mb-1">Developer Profiles</div>
                      <p className="text-[#57606a]">Follow developers, share public repositories, and showcase project readmes.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#f6f8fa] border-t border-[#d0d7de] px-6 py-3 flex justify-end">
              <button 
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-1.5 bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] text-[#24292f] text-xs font-semibold rounded-md transition-colors"
              >
                Close Documentation
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
