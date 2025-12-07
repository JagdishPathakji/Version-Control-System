import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import {
  User,
  Users,
  GitBranch,
  Star,
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

interface PublicUserProfile {
  _id: string;
  username: string;
  createdAt: string;
  followedUser: number;
  followingUser: number;
  description: string;
}

export default function PublicProfile({
  setIsAuthenticated,
}: {
  setIsAuthenticated: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  const { username } = useParams();

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [follower,setFollower] = useState(null)
  const [followstatus,setFollowstatus] = useState(null)

  const addAFollower = async (username) => {

    try {

      const res = await fetch(`https://version-control-system-mebn.onrender.com/follower/${username}`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: "include"
      })

      const data = await res.json()
      if(data.status === false) {
        alert(data.message)
      }
      else {
        setFollower(data.count)
        setFollowstatus(data.followstatus)
      }
    }
    catch(error) {
      console.log("Error occcured during following",error)
    }
  } 

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const res = await fetch(`https://version-control-system-mebn.onrender.com/getPublicProfile/${username}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (data.status) {
          setProfile(data.profile);
          // Only show public repositories
          const publicRepos = data.repos.filter(
            (repo: Repository) => repo.visibility === "public"
          );
          setRepos(publicRepos);
          setFollowstatus(data.followstatus)
          setFollower(data.profile.followingUser)
        }
      } catch (err) {
        console.error("Error fetching public profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

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
        username={localStorage.getItem("username") || ""}
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

          {/* Profile Info */}
          <div className="flex flex-col sm:items-start items-center text-center sm:text-left flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">{profile.username}</h1>
            <p className="text-gray-400 mt-4 italic text-sm max-w-lg leading-relaxed">
              {profile.description || "No bio available."}
            </p>

            {/* FOLLOW BUTTON */}
            <button
              className="mt-5 px-5 py-2 rounded-full bg-gradient-to-r from-[#ff006e] to-[#00d9ff] hover:from-[#ff1a7e] hover:to-[#1ae5ff] text-white font-semibold transition-all shadow-lg shadow-[#ff006e]/40 active:scale-95"
              onClick={()=>addAFollower(profile.username)}
            >
              {followstatus ? "following": "follow"}
            </button>

            <div className="flex gap-6 mt-6 text-sm">
              <span className="flex items-center gap-2 text-[#ff006e] font-semibold">
                <Users className="w-4 h-4" /> {profile.followedUser}
                <span className="text-gray-400 font-normal ml-1">Followings</span>
              </span>
              <span className="flex items-center gap-2 text-[#00d9ff] font-semibold">
                <Users className="w-4 h-4 rotate-180" /> {follower}
                <span className="text-gray-400 font-normal ml-1">Followers</span>
              </span>
            </div>
          </div>
        </div>

        {/* ---- PUBLIC REPOS ---- */}
        <div className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#00d9ff]/30 rounded-2xl p-6 shadow-2xl hover:shadow-[0_0_50px_rgba(0,217,255,0.15)] transition-all duration-300">
          <h2 className="text-lg font-bold bg-gradient-to-r from-[#00d9ff] to-[#ff006e] bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#00d9ff]" /> Public Repositories
          </h2>

          {repos.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No public repositories yet.</p>
          ) : (
            <div className="space-y-4">
              {repos.map((repo) => (
                <div
                  key={repo._id}
                  onClick={() => navigate(`/repo/public/${repo.name}`)}
                  className="border border-[#00d9ff]/20 bg-[#0d0221]/60 hover:bg-[#0d0221]/80 p-5 rounded-xl transition-all cursor-pointer hover:shadow hover:shadow-[#00d9ff]/30 group"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-100 group-hover:text-[#00d9ff] font-semibold text-lg transition-colors">
                      {repo.name}
                    </h3>
                    <Globe className="w-4 h-4 text-[#00d9ff]" />
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
      </main>
    </div>
  );
}
