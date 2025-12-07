import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import StreakGrid from "./StreakGrid"
import {
  User,
  Mail,
  Users,
  GitBranch,
  Star,
  Lock,
  Globe,
} from "lucide-react";

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
  const [streak, setStreak] = useState(null)

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
            'Content-Type': 'application/json'
          },
          credentials: "include",
          method: "GET"
        })

        const data = await response.json()
        if(data.status === true) {
          setStreak(data.dailyCommits)
        }
        else {
          alert(data.message)
        }
      }
      catch(error) {
        console.log("Error in fetching streak",error)
      }
    }

    fetchProfileData()
    fetchStreak()
  }, []);

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
        <div className="flex flex-col sm:flex-row gap-10 items-center sm:items-start bg-[#1a1629]/90 backdrop-blur-xl border border-[#ff006e]/30 rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_50px_rgba(255,0,110,0.15)] transition-all duration-300">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-[#ff006e] to-[#00d9ff] p-8 rounded-full shadow-lg shadow-[#ff006e]/40">
              <User className="w-16 h-16 text-white" />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Joined on {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Profile Details */}
          <div className="flex flex-col sm:items-start items-center text-center sm:text-left flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">{profile.username}</h1>
            <div className="flex items-center gap-2 text-gray-400 mt-1 text-sm">
              <Mail className="w-4 h-4" />
              <span>{profile.email}</span>
            </div>
            <p className="text-gray-400 mt-4 italic text-sm max-w-lg leading-relaxed">
              {profile.description || "No bio provided yet. You can add one to tell the world who you are."}
            </p>

           <div className="w-full px-3 mt-6">
            <div className="flex flex-wrap justify-center gap-y-2 gap-x-4 text-xs sm:text-sm text-center">
              <div className="flex items-center justify-center gap-1 text-[#ff006e] font-semibold min-w-[100px]">
                <Users className="w-4 h-4 shrink-0" />
                {profile.followedUser}
                <span className="text-gray-400 font-normal ml-1">Followings</span>
              </div>
          
              <div className="flex items-center justify-center gap-1 text-[#00d9ff] font-semibold min-w-[100px]">
                <Users className="w-4 h-4 rotate-180 shrink-0" />
                {profile.followingUser}
                <span className="text-gray-400 font-normal ml-1">Followers</span>
              </div>
          
              <div className="flex items-center justify-center gap-1 text-[#ffbe0b] font-semibold min-w-[100px]">
                <GitBranch className="w-4 h-4 shrink-0" />
                {profile.repositories}
                <span className="text-gray-400 font-normal ml-1">Repositories</span>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* ---- REPOSITORY LIST ---- */}
        <div className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#00d9ff]/30 rounded-2xl p-6 shadow-2xl hover:shadow-[0_0_50px_rgba(0,217,255,0.15)] transition-all duration-300">
          <h2 className="text-lg font-bold bg-gradient-to-r from-[#00d9ff] to-[#ff006e] bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#00d9ff]" /> My Repositories
          </h2>

          {repos.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No repositories yet.</p>
          ) : (
            <div className="space-y-4">
              {repos.map((repo) => (
                <div
                  key={repo._id}
                  onClick={() => navigate(`/repo/${repo.name}`)}
                  className="border border-[#ff006e]/20 bg-[#0d0221]/60 hover:bg-[#0d0221]/80 p-5 rounded-xl transition-all cursor-pointer hover:shadow hover:shadow-[#ff006e]/30 group"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-100 group-hover:text-[#ff006e] font-semibold text-lg transition-colors">
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
                        <Star className="w-3 h-3 text-[#ffbe0b]" /> {repo.starred.length}
                      </span>
                      <span>
                        Updated on{" "}
                        {new Date(repo.updatedAt).toLocaleDateString()}
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
