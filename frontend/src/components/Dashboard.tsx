import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { cachedFetch } from "../utils/apiCache";
import { User, Users, Globe, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getAllProfile from "../functionalities/getAllProfile";

export default function Dashboard({ setIsAuthenticated }: { setIsAuthenticated?: (val: boolean) => void }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Developer";
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    cachedFetch('https://version-control-system-mebn.onrender.com/user/repos', { credentials: 'include' })
      .then(data => {
        if (data.status) setRepos(data.repos);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 text-gray-800">
      <Navbar
        username={username}
        setIsAuthenticated={setIsAuthenticated}
        navigate={navigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Sidebar - Repositories */}
        <div className="lg:col-span-1 bg-white/90 backdrop-blur-xl border border-gray-200 p-6 shadow-xl rounded-xl h-fit">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
            <h2 className="text-xl font-bold text-gray-800">Your Repositories</h2>
            <button 
              onClick={() => navigate('/repo/new')}
              className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded hover:opacity-90 transition-opacity"
            >
              New
            </button>
          </div>
          
          {repos.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">You don't have any repositories yet.</p>
          ) : (
            <ul className="space-y-3">
              {repos.map((repo: any) => (
                <li key={repo._id}>
                  <div 
                    onClick={() => navigate(`/repo/${username}/${repo.name}`)}
                    className="block cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-[#b428b4]/5 border border-transparent hover:border-[#b428b4]/30 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-blue-600 font-semibold text-lg hover:underline truncate mr-2">{repo.name}</h3>
                      {repo.isPrivate ? (
                        <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                      ) : (
                        <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </div>
                    {repo.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2 mb-2">{repo.description}</p>}
                    <div className="mt-2 text-[10px] text-gray-400 font-mono">
                      Updated {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : 'recently'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Main Content - Welcome & Users */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl border border-[#3023ae]/30 p-8 sm:p-12 shadow-2xl rounded-xl transition-all duration-300">
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-[#3023ae] to-[#b428b4] bg-clip-text text-transparent tracking-tight">
              Welcome to Girgit Space
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl">
              Hello <span className="font-semibold text-gray-700">{username}</span>! You're ready to start building.
            </p>
          </div>

          <div className="mt-8 border-t border-[#b428b4]/20 pt-10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#b428b4] to-[#3023ae] bg-clip-text text-transparent mb-2 flex items-center gap-2 justify-center">
              <Users className="w-6 h-6 text-[#3023ae]" />
              Discover Developers
            </h2>
            <p className="text-center text-gray-500 text-sm mb-8">
              Explore the community, find interesting projects, and collaborate with developers worldwide.
            </p>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-10 h-10 border-4 border-[#b428b4] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 mt-3 font-semibold">Loading community...</p>
              </div>
            ) : profiles.length === 0 ? (
              <p className="text-center text-gray-500 py-12 bg-gray-50 border border-gray-200 rounded-xl shadow-inner">
                No users found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {profiles.map((profile: any, index: number) => (
                  <div 
                    key={index} 
                    onClick={() => navigate(`/publicProfile/${profile.username}`)}
                    className="group flex flex-col items-center gap-4 p-6 border border-[#b428b4]/20 bg-white hover:bg-gradient-to-b hover:from-white hover:to-[#b428b4]/5 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-[#b428b4]/40 rounded-xl"
                  >
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#b428b4] to-[#3023ae] border border-[#b428b4]/30 rounded-full flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center w-full">
                      <h4 className="font-bold text-lg text-gray-800 group-hover:text-[#3023ae] transition-colors truncate">
                        {profile.username || "Unknown"}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {profile.email}
                      </p>
                    </div>
                    <button className="mt-2 px-6 py-1.5 rounded-full border border-[#b428b4] text-[#b428b4] text-xs font-semibold group-hover:bg-[#b428b4] group-hover:text-white transition-colors w-full">
                        View Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
