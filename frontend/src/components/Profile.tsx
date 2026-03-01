import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import StreakGrid from "./StreakGrid";
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
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Repository {
  _id: string;
  name: string;
  description: string;
  visibility: "public" | "private";
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
        const response = await fetch("https://version-control-system-mebn.onrender.com/getOwnProfile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await response.json();
        if (data.status) {
          setProfile(data.profile);
          setRepos(data.repos);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStreak = async () => {
      try {
        const response = await fetch(`https://version-control-system-mebn.onrender.com/getStreak/${username}`, {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          method: "GET",
        });

        const data = await response.json();
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
      <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] flex flex-col items-center justify-center text-gray-300">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff006e] mb-4"></div>
        <p>Loading profile...</p>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-300 flex items-center justify-center">
        <p>Profile not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-200 flex flex-col">
      <Navbar
        username={username}
        setIsAuthenticated={setIsAuthenticated}
        navigate={navigate}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 space-y-10">

        {/* ---- PROFILE HEADER ---- */}
        <div className="grid grid-cols-12 gap-8 bg-[#1a1629]/90 backdrop-blur-xl border border-[#ff006e]/30 shadow-2xl transition-all duration-300">
          {/* Left Avatar */}
          <div className="col-span-12 sm:col-span-4 flex flex-col items-center justify-center border-r border-[#ff006e]/20 px-6 py-8">
            <div className="bg-gradient-to-br from-[#ff006e] to-[#00d9ff] p-8 shadow-lg shadow-[#ff006e]/40">
              <User className="w-16 h-16 text-white" />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Joined on {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Right Profile Info */}
          <div className="col-span-12 sm:col-span-8 px-6 py-8">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
                {profile.username}
              </h1>

              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>

              <div className="relative group">
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="w-full bg-[#0d0221]/50 border border-[#ff006e]/30 p-3 rounded text-sm text-gray-200 focus:outline-none focus:border-[#ff006e] transition-all"
                      rows={3}
                      placeholder="Tell the world who you are..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleSaveDescription}
                        className="flex items-center gap-1 px-3 py-1 bg-[#ff006e] text-white text-xs font-semibold rounded hover:bg-[#ff006e]/80 transition-all shadow-lg shadow-[#ff006e]/20"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-white text-xs font-semibold rounded hover:bg-gray-600 transition-all"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="text-gray-400 italic text-sm leading-relaxed flex-1">
                      {profile.description ||
                        "No bio provided yet. You can add one to tell the world who you are."}
                    </p>
                    <button
                      onClick={startEditing}
                      className="p-1.5 text-gray-500 hover:text-[#ff006e] transition-colors"
                      title="Edit description"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="flex flex-col items-center justify-center text-center border border-[#ff006e]/20 px-4 py-4">
                  <div className="flex items-center gap-2 text-[#ff006e] font-semibold">
                    <Users className="w-4 h-4" />
                    {profile.followedUser}
                  </div>
                  <span className="text-gray-400 text-xs mt-1">Followings</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center border border-[#00d9ff]/20 px-4 py-4">
                  <div className="flex items-center gap-2 text-[#00d9ff] font-semibold">
                    <Users className="w-4 h-4 rotate-180" />
                    {profile.followingUser}
                  </div>
                  <span className="text-gray-400 text-xs mt-1">Followers</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center border border-[#ffbe0b]/20 px-4 py-4">
                  <div className="flex items-center gap-2 text-[#ffbe0b] font-semibold">
                    <GitBranch className="w-4 h-4" />
                    {profile.repositories}
                  </div>
                  <span className="text-gray-400 text-xs mt-1">Repositories</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---- PROFILE README SECTION ---- */}
        <div className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#ff006e]/30 shadow-2xl overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 border-b border-[#ff006e]/20 flex justify-between items-center bg-[#0d0221]/40">
            <div className="flex items-center gap-2 text-sm font-mono text-gray-400">
              <FileText className="w-4 h-4 text-[#ff006e]" />
              <span>{profile.username} / README.md</span>
            </div>
            {!isEditingReadme && (
              <button
                onClick={startEditingReadme}
                className="text-xs text-[#00d9ff] hover:underline flex items-center gap-1"
              >
                <Pencil className="w-3 h-3" /> {profile.readme ? "Edit README" : "Add README"}
              </button>
            )}
          </div>

          <div className="p-6">
            {isEditingReadme ? (
              <div className="space-y-4">
                <textarea
                  value={editedReadme}
                  onChange={(e) => setEditedReadme(e.target.value)}
                  className="w-full bg-[#0d0221]/50 border border-[#ff006e]/30 p-4 rounded text-sm text-gray-200 font-mono focus:outline-none focus:border-[#ff006e] transition-all"
                  rows={12}
                  placeholder="### Hi there 👋 Write your profile README using Markdown..."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleSaveReadme}
                    className="flex items-center gap-1 px-4 py-2 bg-[#ff006e] text-white text-xs font-semibold rounded hover:bg-[#ff006e]/80 transition-all shadow-lg shadow-[#ff006e]/20"
                  >
                    <Check className="w-3 h-3" /> Save README
                  </button>
                  <button
                    onClick={() => setIsEditingReadme(false)}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-700 text-white text-xs font-semibold rounded hover:bg-gray-600 transition-all"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group prose prose-invert max-w-none text-gray-300 prose-headings:text-[#00d9ff] prose-a:text-[#ff006e] prose-strong:text-[#ffbe0b] prose-code:text-[#ff006e] prose-pre:bg-[#0d0221]/80">
                {profile.readme ? (
                  <>
                    <button
                      onClick={startEditingReadme}
                      className="absolute -top-2 -right-2 p-2 bg-[#0d0221] border border-[#ff006e]/30 text-gray-500 hover:text-[#ff006e] opacity-0 group-hover:opacity-100 transition-all rounded shadow-xl"
                      title="Edit README"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
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
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {profile.readme}
                    </ReactMarkdown>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 border border-dashed border-[#ff006e]/20 rounded-lg bg-[#0d0221]/20">
                    <p className="text-gray-500 italic text-sm mb-4">You can add a README to your profile to tell the world about yourself!</p>
                    <button
                      onClick={startEditingReadme}
                      className="px-4 py-2 border border-[#ff006e] text-[#ff006e] text-xs font-semibold rounded hover:bg-[#ff006e] hover:text-white transition-all"
                    >
                      Initialize Profile README
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---- REPOSITORY LIST ---- */}
        <div className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#00d9ff]/30 shadow-2xl transition-all duration-300">
          <div className="px-6 py-6 border-b border-[#00d9ff]/20">
            <h2 className="text-lg font-bold bg-gradient-to-r from-[#00d9ff] to-[#ff006e] bg-clip-text text-transparent flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-[#00d9ff]" /> My Repositories
            </h2>
          </div>

          {repos.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No repositories yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
              {repos.map((repo) => (
                <div
                  key={repo._id}
                  onClick={() => navigate(`/repo/${repo.name}`)}
                  className="border border-[#ff006e]/20 bg-[#0d0221]/60 hover:bg-[#0d0221]/80 p-5 cursor-pointer hover:shadow hover:shadow-[#ff006e]/30 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-100 hover:text-[#ff006e] font-semibold text-lg">
                      {repo.name}
                    </h3>
                    {repo.visibility === "public" ? (
                      <Globe className="w-4 h-4 text-[#00d9ff]" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-500" />
                    )}
                  </div>

                  <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                    {repo.description || "No description provided."}
                  </p>

                  <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#ffbe0b]" /> {typeof repo.starred === 'number' ? repo.starred : (Array.isArray(repo.starred) ? (repo.starred as any).length : 0)}
                      </span>
                      <span>
                        Updated on {new Date(repo.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="italic text-gray-600">
                      Created {new Date(repo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <StreakGrid streak={streak} />
      </main>
    </div>
  );
}