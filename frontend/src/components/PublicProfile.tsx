import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import {
  User,
  Users,
  GitBranch,
  Star,
  Lock,
  Globe,
  Settings,
  BookOpen,
  FileText,
  Search,
  Mail
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cachedFetch, clearCache } from "../utils/apiCache";

interface Repository {
  _id: string;
  name: string;
  description: string;
  visibility: "public" | "private";
  isPrivate: boolean;
  starred: number;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  repositories: number;
  followedUser: number;
  followingUser: number;
  description: string;
  readme: string;
}

export default function PublicProfile({
  setIsAuthenticated,
}: {
  setIsAuthenticated: (value: boolean) => void;
}) {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [follower, setFollower] = useState<number | null>(null);
  const [followstatus, setFollowstatus] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "repositories" | "stars">("overview");
  const [repoSearch, setRepoSearch] = useState("");

  useEffect(() => {
    if (!username) return;

    const loggedInUser = localStorage.getItem("username");
    if (loggedInUser && username.toLowerCase() === loggedInUser.toLowerCase()) {
      navigate("/profile", { replace: true });
      return;
    }

    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch public profile with username in URL path
        let data: any = null;
        try {
          data = await cachedFetch(
            `https://version-control-system-mebn.onrender.com/getPublicProfile/${username}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
        } catch (getErr) {
          // Fallback to POST with body
          data = await cachedFetch(
            `https://version-control-system-mebn.onrender.com/getPublicProfile/${username}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username }),
              credentials: "include",
            }
          );
        }

        if (data && data.status && data.profile) {
          if (data.profile.isOwnProfile) {
            navigate("/profile", { replace: true });
            return;
          }
          setProfile(data.profile);
          setFollower(data.profile.followingUser);
          setFollowstatus(Boolean(data.followstatus));

          try {
            // Fetch user's public repositories
            let reposData: any = await cachedFetch(
              `https://version-control-system-mebn.onrender.com/public/repos/${username}`,
              { credentials: "include" }
            );

            if (!reposData || !reposData.status) {
              reposData = await cachedFetch(
                `https://version-control-system-mebn.onrender.com/user/${username}/repos`,
                { credentials: "include" }
              );
            }

            if (reposData && reposData.status && Array.isArray(reposData.repos)) {
              setRepos(reposData.repos);
            }
          } catch (e) {
            console.error("Failed to fetch public repos", e);
          }
        } else {
          setError(data?.message || "Requested user profile not found");
        }
      } catch (err: any) {
        setError(err?.message || "Error fetching public profile");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

  const addAFollower = async (targetUsername: string) => {
    try {
      const data = await cachedFetch(
        `https://version-control-system-mebn.onrender.com/follower/${targetUsername}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (data && data.status === true) {
        clearCache(`getPublicProfile/${targetUsername}`);
        setFollowstatus(prev => !prev);
        if (typeof data.count === 'number') {
          setFollower(data.count);
        } else {
          setFollower(prev => (followstatus ? Math.max(0, (prev || 1) - 1) : (prev || 0) + 1));
        }
      } else {
        alert(data?.message || "Failed to update follow status");
      }
    } catch (error: any) {
      alert("Error in following: " + error.message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#f6f8fa] flex flex-col items-center justify-center text-[#57606a] font-sans">
        <div className="inline-block w-8 h-8 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs">Loading profile...</p>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-[#f6f8fa] text-[#57606a] flex items-center justify-center font-sans p-4">
        <div className="bg-white border border-[#d0d7de] p-6 rounded-md shadow-sm max-w-sm text-center">
          <p className="text-sm font-medium text-[#cf222e] mb-2">{error || "Profile not found"}</p>
          <Link to="/dashboard" className="text-xs text-[#0969da] hover:underline inline-block">&larr; Return to dashboard</Link>
        </div>
      </div>
    );

  const filteredRepos = repos.filter(r => 
    r.name.toLowerCase().includes(repoSearch.toLowerCase())
  );
  const pinnedRepos = repos.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col">
      <Navbar
        username={localStorage.getItem("username") || ""}
        setIsAuthenticated={setIsAuthenticated}
        navigate={navigate}
      />

      {/* GitHub Tabs Header */}
      <div className="border-b border-[#d0d7de] bg-[#f6f8fa] pt-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto -mb-[1px]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-semibold transition-colors ${
              activeTab === "overview"
                ? "border-[#fd8c73] text-[#1f2328]"
                : "border-transparent text-[#57606a] hover:text-[#1f2328] hover:border-[#d0d7de]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("repositories")}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-semibold transition-colors ${
              activeTab === "repositories"
                ? "border-[#fd8c73] text-[#1f2328]"
                : "border-transparent text-[#57606a] hover:text-[#1f2328] hover:border-[#d0d7de]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Repositories</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-[#afb8c1]/20 rounded-full font-normal">
              {repos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("stars")}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-semibold transition-colors ${
              activeTab === "stars"
                ? "border-[#fd8c73] text-[#1f2328]"
                : "border-transparent text-[#57606a] hover:text-[#1f2328] hover:border-[#d0d7de]"
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Stars</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-[#afb8c1]/20 rounded-full font-normal">
              0
            </span>
          </button>
        </div>
      </div>

      {/* Main Profile Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ---- LEFT COLUMN: USER INFO (GitHub Sidebar) ---- */}
          <div className="lg:w-1/4 flex flex-col space-y-4 shrink-0">
            
            {/* Avatar - GitHub Style */}
            <div className="w-64 h-64 sm:w-72 sm:h-72 mx-auto lg:mx-0 bg-[#f0f2f5] rounded-full border border-[#d0d7de] flex items-center justify-center overflow-hidden shadow-sm relative group">
              <span className="text-7xl font-bold text-[#57606a] select-none">
                {(profile.username || 'U').charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Names */}
            <div>
              <h1 className="text-2xl font-bold text-[#1f2328] leading-tight">
                {profile.username}
              </h1>
              <p className="text-sm text-[#57606a]">
                {profile.username}
              </p>
            </div>

            {/* Bio */}
            <div>
              <p className="text-xs text-[#24292f] leading-relaxed">
                {profile.description || "No bio provided."}
              </p>

              {username !== localStorage.getItem("username") ? (
                <button
                  className="w-full mt-3 px-3 py-1.5 bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] text-[#24292f] text-xs font-semibold rounded-md transition-colors text-center"
                  onClick={() => addAFollower(profile.username)}
                >
                  {followstatus ? "Unfollow" : "Follow"}
                </button>
              ) : (
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full mt-3 px-3 py-1.5 bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] text-[#24292f] text-xs font-semibold rounded-md transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Edit profile</span>
                </button>
              )}
            </div>

            {/* Followers / Following counts */}
            <div className="flex items-center gap-2 text-xs text-[#57606a] pt-1">
              <Users className="w-4 h-4 text-[#57606a]" />
              <button 
                onClick={() => setActiveTab("overview")}
                className="hover:text-[#0969da] transition-colors"
              >
                <strong className="text-[#1f2328] font-semibold">{follower !== null ? follower : profile.followingUser}</strong> followers
              </button>
              <span>&middot;</span>
              <button 
                onClick={() => setActiveTab("overview")}
                className="hover:text-[#0969da] transition-colors"
              >
                <strong className="text-[#1f2328] font-semibold">{profile.followedUser}</strong> following
              </button>
            </div>

            {/* Email */}
            {profile.email && (
              <div className="flex items-center gap-2 text-xs text-[#57606a] pt-1">
                <Mail className="w-3.5 h-3.5 text-[#57606a]" />
                <span className="truncate">{profile.email}</span>
              </div>
            )}
          </div>

          {/* ---- RIGHT COLUMN: TAB CONTENT ---- */}
          <div className="lg:w-3/4 flex flex-col space-y-6 min-w-0">
            
            {activeTab === "overview" && (
              <>
                {/* Profile README Section */}
                {profile.readme && (
                  <div className="bg-white border border-[#d0d7de] rounded-md overflow-hidden shadow-sm">
                    <div className="px-4 py-2.5 border-b border-[#d0d7de] flex justify-between items-center bg-[#f6f8fa]">
                      <h2 className="text-xs font-semibold text-[#57606a] flex items-center gap-2">
                        <span className="font-mono text-[#1f2328]">{username}</span> / README.md
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="prose prose-sm max-w-none text-[#1f2328]">
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
                                <code className="bg-[#afb8c1]/20 px-1 py-0.5 rounded text-xs font-mono text-[#0969da]" {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {profile.readme}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pinned Repositories Grid (2x3) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[#1f2328]">Pinned</h2>
                    <button 
                      onClick={() => setActiveTab("repositories")}
                      className="text-xs text-[#0969da] hover:underline"
                    >
                      View all ({repos.length})
                    </button>
                  </div>

                  {pinnedRepos.length === 0 ? (
                    <div className="border border-[#d0d7de] rounded-md p-8 text-center bg-white text-xs text-[#57606a]">
                      No repositories available.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {pinnedRepos.map((repo) => (
                        <div
                          key={repo._id}
                          onClick={() => navigate(`/repo/${username}/${repo.name}`)}
                          className="bg-white border border-[#d0d7de] rounded-md p-4 hover:border-[#8c959f] transition-all cursor-pointer flex flex-col shadow-xs"
                        >
                          <div className="flex items-start justify-between mb-1.5">
                            <h3 className="font-semibold text-[#0969da] text-xs hover:underline truncate pr-2">
                              {repo.name}
                            </h3>
                            <span className="text-[10px] font-medium text-[#57606a] border border-[#d0d7de] px-1.5 py-0.2 rounded-full shrink-0">
                              {repo.isPrivate ? "Private" : "Public"}
                            </span>
                          </div>

                          <p className="text-xs text-[#57606a] mb-4 line-clamp-2 flex-grow">
                            {repo.description || "No description provided."}
                          </p>

                          <div className="flex items-center gap-4 text-[11px] text-[#57606a] mt-auto">
                            <div className="flex items-center gap-1">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#f1e05a]"></div>
                              <span>JavaScript</span>
                            </div>
                            <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "repositories" && (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#d0d7de]">
                  <div className="relative flex-1 max-w-md">
                    <input 
                      type="text"
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      placeholder="Find a repository..."
                      className="w-full bg-white border border-[#d0d7de] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#1f2328] focus:outline-none focus:border-[#0969da]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#57606a] absolute left-2.5 top-2.5" />
                  </div>
                </div>

                {/* Repositories List */}
                <div className="divide-y divide-[#d0d7de]">
                  {filteredRepos.map((repo) => (
                    <div key={repo._id} className="py-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link 
                            to={`/repo/${username}/${repo.name}`}
                            className="font-semibold text-sm text-[#0969da] hover:underline"
                          >
                            {repo.name}
                          </Link>
                          <span className="text-[10px] font-medium text-[#57606a] border border-[#d0d7de] px-1.5 py-0.2 rounded-full">
                            {repo.isPrivate ? "Private" : "Public"}
                          </span>
                        </div>
                        {repo.description && (
                          <p className="text-xs text-[#57606a] mb-2">{repo.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[#57606a]">
                          <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#f1e05a]"></div>
                            <span>JavaScript</span>
                          </div>
                          <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => navigate(`/repo/${username}/${repo.name}`)}
                        className="px-2.5 py-1 text-xs font-medium text-[#24292f] bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] rounded-md shadow-xs"
                      >
                        View
                      </button>
                    </div>
                  ))}

                  {filteredRepos.length === 0 && (
                    <div className="py-12 text-center text-xs text-[#57606a]">
                      No repositories matched your search.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "stars" && (
              <div className="border border-[#d0d7de] rounded-md bg-white p-12 text-center text-xs text-[#57606a]">
                This user has not starred any repositories yet.
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
