import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import {
  User,
  Users,
  GitBranch,
  Star,
  Globe,
  FileText,
  Settings,
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cachedFetch } from "../utils/apiCache";

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

interface PublicUserProfile {
  _id: string;
  username: string;
  createdAt: string;
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
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { username } = useParams();

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [follower, setFollower] = useState(null);
  const [followstatus, setFollowstatus] = useState(null);

  const addAFollower = async (targetUsername: any) => {
    try {
      const res = await fetch(
        `https://version-control-system-mebn.onrender.com/follower/${targetUsername}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await res.json();
      if (data.status === false) {
        alert(data.message);
      } else {
        setFollower(data.count);
        setFollowstatus(data.followstatus);
      }
    } catch (error) {
      console.log("Error occcured during following", error);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await cachedFetch(
          `https://version-control-system-mebn.onrender.com/getPublicProfile/${username}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!data.status) throw new Error(data.message);

        setProfile(data.profile);
        setFollowstatus(data.followstatus);
        setFollower(data.profile.followingUser);

        // Fetch public repositories specifically
        const reposData = await cachedFetch(
          `https://version-control-system-mebn.onrender.com/public/repos/${username}`
        );
        if (reposData.status) {
          setRepos(reposData.repos);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-600 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3023ae] mb-4"></div>
        <p>Loading profile...</p>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-gray-50 text-gray-600 flex items-center justify-center font-sans">
        <p>{error || "Profile not found"}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-gray-800 font-sans flex flex-col">
      <Navbar
        username={localStorage.getItem("username") || ""}
        setIsAuthenticated={setIsAuthenticated}
        navigate={navigate}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ---- LEFT COLUMN: USER INFO ---- */}
          <div className="lg:w-1/4 flex flex-col space-y-6 shrink-0">
            
            {/* Avatar & Basic Info */}
            <div className="flex flex-col">
              <div className="w-64 h-64 mx-auto lg:mx-0 bg-gradient-to-br from-[#b428b4] to-[#3023ae] rounded-full flex items-center justify-center shadow-lg mb-6 border border-gray-200 overflow-hidden relative group">
                <User className="w-24 h-24 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                {profile.username}
              </h1>

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex flex-col gap-3">
                  <p className="text-gray-700 text-[15px] leading-relaxed">
                    {profile.description || "No bio provided."}
                  </p>

                  {username !== localStorage.getItem("username") ? (
                    <button
                      className="w-full mt-2 px-3 py-1.5 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200 transition-all text-center"
                      onClick={() => addAFollower(profile.username)}
                    >
                      {followstatus ? "Unfollow" : "Follow"}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full mt-2 px-3 py-1.5 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200 transition-all text-center flex items-center justify-center gap-2"
                    >
                      <Settings className="w-4 h-4" /> Manage Profile
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-sm mt-3">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">{follower !== null ? follower : profile.followingUser}</span> followers
                  <span className="text-gray-400">·</span>
                  <span className="font-semibold text-gray-900">{profile.followedUser}</span> following
                </div>
              </div>
            </div>
          </div>

          {/* ---- RIGHT COLUMN: CONTENT ---- */}
          <div className="lg:w-3/4 flex flex-col space-y-8 min-w-0">
            
            {/* Profile README Section */}
            {profile.readme && (
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden w-full">
                <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                  <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="font-mono text-gray-500">{username}</span> / README.md
                  </h2>
                </div>
                <div className="p-6">
                  <div className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed overflow-x-auto break-words">
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
                            <code className={`${className} bg-gray-100 px-1 py-0.5 rounded text-[#b428b4]`} {...props}>
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
            
            {/* Repositories */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium text-gray-900 flex items-center gap-2">
                  Public Repositories
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold py-0.5 px-2 rounded-full">
                    {repos.length}
                  </span>
                </h2>
              </div>

              {repos.length === 0 ? (
                <div className="border border-gray-300 rounded-lg p-12 text-center bg-white w-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{username} doesn't have any public repositories yet.</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {repos.map((repo) => (
                    <div
                      key={repo._id}
                      onClick={() => navigate(`/repo/${username}/${repo.name}`)}
                      className="bg-white border border-gray-300 rounded-lg p-5 hover:border-gray-400 transition-all cursor-pointer flex flex-col w-full min-w-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-[#0969da] text-lg hover:underline truncate pr-4">
                          {repo.name}
                        </h3>
                        <span className="text-xs font-semibold text-gray-500 border border-gray-300 px-2 py-0.5 rounded-full shrink-0">
                          {repo.isPrivate ? "Private" : "Public"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-6 line-clamp-2 flex-grow break-words">
                        {repo.description || "No description."}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[#f1e05a]"></div>
                          JavaScript
                        </div>
                        <span>Updated on {new Date(repo.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Removed Streak Grid since the component does not exist */}

          </div>
        </div>
      </main>
    </div>
  );
}
