import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import { cachedFetch } from "../utils/apiCache";
import { 
    BookOpen, 
    Lock, 
    Globe, 
    Search, 
    Plus, 
    Star, 
    Users, 
    User, 
    GitFork,
    Sparkles,
    Activity,
    ExternalLink
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getAllProfile from "../functionalities/getAllProfile";

export default function Dashboard({ setIsAuthenticated }: { setIsAuthenticated?: (val: boolean) => void }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Developer";
  const [repos, setRepos] = useState<any[]>([]);
  const [repoFilter, setRepoFilter] = useState("");

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
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const profiles = Array.isArray(profilesRes?.data) ? profilesRes.data : [];

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
        
        {/* ---- LEFT COLUMN: TOP REPOSITORIES (GitHub Left Sidebar) ---- */}
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
                        {/* Tiny Avatar or Icon */}
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
            </div>
          </div>
        </div>

        {/* ---- CENTER COLUMN: ACTIVITY FEED & DEVELOPERS (GitHub Main Feed) ---- */}
        <div className="lg:col-span-6 space-y-4">
          {/* Feed Header */}
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
                {profiles.map((profile: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div 
                      onClick={() => navigate(`/publicProfile/${profile.username}`)}
                      className="flex items-center gap-3 cursor-pointer min-w-0"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#d0d7de] text-[#24292f] flex items-center justify-center font-bold text-sm shrink-0">
                        {(profile.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-[#1f2328] hover:text-[#0969da] hover:underline truncate">
                          {profile.username || "Unknown"}
                        </div>
                        <div className="text-[11px] text-[#57606a] truncate">
                          {profile.email}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/publicProfile/${profile.username}`)}
                      className="px-3 py-1 bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] rounded-md text-xs font-semibold text-[#24292f] transition-colors shrink-0"
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---- RIGHT COLUMN: EXPLORE & NEWS (GitHub Right Sidebar) ---- */}
        <div className="lg:col-span-3 space-y-4">
          {/* Girgit Space Info Box */}
          <div className="border border-[#d0d7de] rounded-md bg-white p-4 shadow-sm text-xs space-y-3">
            <div className="font-semibold text-sm text-[#1f2328] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#e3b341]" />
              <span>About Girgit</span>
            </div>
            <p className="text-[#57606a] leading-relaxed">
              Girgit is a fast, lightweight Git-compatible version control platform backed by high-availability cloud object storage.
            </p>
            <div className="border-t border-[#d0d7de] pt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-[#0969da] hover:underline flex items-center gap-1 font-medium"
              >
                <span>Documentation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* CLI Cheatsheet Box */}
          <div className="border border-[#d0d7de] rounded-md bg-white p-4 shadow-sm text-xs space-y-2">
            <div className="font-semibold text-sm text-[#1f2328]">Girgit CLI</div>
            <p className="text-[#57606a]">Quick commands for your terminal:</p>
            <div className="bg-[#f6f8fa] border border-[#d0d7de] rounded p-2 font-mono text-[11px] text-[#24292f] space-y-1 select-all">
              <div>girgit init</div>
              <div>girgit add .</div>
              <div>girgit commit -m "update"</div>
              <div>girgit push</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
