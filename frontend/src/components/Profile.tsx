import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import {
  User,
  Mail,
  Users,
  GitBranch,
  Star,
  Lock,
  Globe,
  Pencil,
  Check,
  X,
  FileText,
  Activity
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

export default function Profile({
  setIsAuthenticated,
}: {
  setIsAuthenticated: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isEditingReadme, setIsEditingReadme] = useState(false);
  const [editedReadme, setEditedReadme] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await cachedFetch("https://version-control-system-mebn.onrender.com/getOwnProfile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (data.status) {
          setProfile(data.profile);
          
          try {
            const reposData = await cachedFetch("https://version-control-system-mebn.onrender.com/user/repos", {
              credentials: "include"
            });
            if (reposData.status) {
              setRepos(reposData.repos || []);
            }
          } catch (e) {
            console.error("Failed to fetch repos", e);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStreak = async () => {
      try {
        const data = await cachedFetch(`https://version-control-system-mebn.onrender.com/getStreak/${username}`, {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          method: "GET",
        });

        if (data.status === true) {
          setStreak(data.dailyCommits);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log("Error in fetching streak", error);
      }
    };

    fetchProfileData();
    fetchStreak();
  }, [username]);

  const handleSaveDescription = async () => {
    try {
      const response = await fetch("https://version-control-system-mebn.onrender.com/updateProfile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: editedDescription }),
        credentials: "include",
      });

      const data = await response.json();
      
      if (data.status) {
        clearCache("Profile");
        if (profile) {
          setProfile({ ...profile, description: editedDescription });
        }
        setIsEditing(false);
      } else {
        alert(data.message || "Failed to update description");
      }
    } catch (error) {
      console.error("Error updating description:", error);
      alert("An error occurred while updating the description");
    }
  };

  const handleSaveReadme = async () => {
    try {
      const response = await fetch("https://version-control-system-mebn.onrender.com/updateProfile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readme: editedReadme }),
        credentials: "include",
      });

      const data = await response.json();
      
      if (data.status) {
        clearCache("Profile");
        if (profile) {
          setProfile({ ...profile, readme: editedReadme });
        }
        setIsEditingReadme(false);
      } else {
        alert(data.message || "Failed to update README");
      }
    } catch (error) {
      console.error("Error updating README:", error);
      alert("An error occurred while updating the README");
    }
  };

  const startEditingReadme = () => {
    setEditedReadme(profile?.readme || "");
    setIsEditingReadme(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedDescription(profile?.description || "");
  };

  const startEditing = () => {
    setEditedDescription(profile?.description || "");
    setIsEditing(true);
  };

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
        <p>Profile not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-gray-800 font-sans flex flex-col">
      <Navbar
        username={username}
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
                  {isEditing ? (
                    <div className="space-y-2 mt-2 w-full">
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800 focus:outline-none focus:border-[#3023ae] focus:ring-1 focus:ring-[#3023ae] transition-all shadow-inner"
                        rows={3}
                        placeholder="Add a bio"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveDescription}
                          className="px-3 py-1 bg-[#2ea043] text-white text-sm font-semibold rounded-md hover:bg-[#2c974b] transition-all flex-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200 transition-all flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative">
                      <p className="text-gray-700 text-[15px] leading-relaxed">
                        {profile.description || "No bio provided."}
                      </p>
                      <button
                        onClick={startEditing}
                        className="w-full mt-3 px-3 py-1.5 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200 transition-all text-center"
                      >
                        Edit profile
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-sm mt-3">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">{profile.followingUser}</span> followers
                  <span className="text-gray-400">·</span>
                  <span className="font-semibold text-gray-900">{profile.followedUser}</span> following
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${profile.email}`} className="hover:text-[#3023ae] hover:underline">{profile.email}</a>
                </div>
              </div>
            </div>
          </div>

          {/* ---- RIGHT COLUMN: CONTENT ---- */}
          <div className="lg:w-3/4 flex flex-col space-y-8 min-w-0">
            
            {/* Profile README Section */}
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden w-full">
              <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="font-mono text-gray-500">{username}</span> / README.md
                </h2>
                {!isEditingReadme && (
                  <button
                    onClick={startEditingReadme}
                    className="text-gray-400 hover:text-[#3023ae] transition-colors p-1"
                    title="Edit README"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="p-6">
                {isEditingReadme ? (
                  <div className="space-y-4">
                    <textarea
                      value={editedReadme}
                      onChange={(e) => setEditedReadme(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 p-4 rounded-md text-sm text-gray-800 focus:outline-none focus:border-[#3023ae] focus:ring-1 focus:ring-[#3023ae] transition-all font-mono"
                      rows={8}
                      placeholder="Hello world!"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setIsEditingReadme(false)}
                        className="px-4 py-1.5 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveReadme}
                        className="px-4 py-1.5 bg-[#2ea043] text-white text-sm font-semibold rounded-md hover:bg-[#2c974b] transition-all"
                      >
                        Commit changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed overflow-x-auto break-words">
                    {profile.readme ? (
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
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500 text-sm mb-4">You can add a README to your profile.</p>
                        <button
                          onClick={startEditingReadme}
                          className="px-4 py-1.5 border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm font-semibold rounded-md transition-all shadow-sm"
                        >
                          Add README
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Repositories */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium text-gray-900 flex items-center gap-2">
                  Repositories
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold py-0.5 px-2 rounded-full">
                    {repos.length}
                  </span>
                </h2>
                <button
                  onClick={() => navigate('/repo/new')}
                  className="px-3 py-1.5 bg-[#2ea043] text-white text-sm font-semibold rounded-md hover:bg-[#2c974b] transition-all shadow-sm flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" /> New
                </button>
              </div>

              {repos.length === 0 ? (
                <div className="border border-gray-300 rounded-lg p-12 text-center bg-white w-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">You don't have any repositories yet.</h3>
                  <p className="text-gray-500 mb-6">Create one to get started.</p>
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
