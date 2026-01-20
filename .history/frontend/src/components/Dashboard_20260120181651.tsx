import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import getData from "../functionalities/getData";
import getRepo from "../functionalities/getRepo";
import getAllProfile from "../functionalities/getAllProfile";
import getAllRepo from "../functionalities/getAllRepo";

import Navbar from "./Navbar";
import { GitBranch, Star, Users, Bot, User } from "lucide-react";

/* Toast */
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const base =
    "fixed top-6 right-6 z-50 px-6 py-4 border text-sm font-semibold shadow-xl backdrop-blur-md animate-slide-in";
  const styles = {
    success:
      "bg-[#0d0221]/90 border-[#00d9ff]/40 text-[#00d9ff] shadow-[0_0_30px_rgba(0,217,255,0.4)]",
    error:
      "bg-[#0d0221]/90 border-red-500/40 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]",
    info:
      "bg-[#0d0221]/90 border-[#ff006e]/40 text-[#ff006e] shadow-[0_0_30px_rgba(255,0,110,0.4)]",
  };

  return (
    <div className={`${base} ${styles[type]}`}>
      {message}
    </div>
  );
}

export default function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const username = localStorage.getItem("username") || "";

  const [activeTab, setActiveTab] = useState("overview");

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // USER DATA
  const { data: userData, error: userError } = useQuery({
    queryKey: ["user", email],
    queryFn: () => getData(email),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // USER REPOS
  const { data: userRepoRes } = useQuery({
    queryKey: ["myRepos"],
    queryFn: getRepo,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const userRepo = Array.isArray(userRepoRes?.data) ? userRepoRes.data : [];

  // PUBLIC REPOS
  const { data: publicReposRes } = useQuery({
    queryKey: ["publicRepos"],
    queryFn: getAllRepo,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const publicRepos = Array.isArray(publicReposRes?.data)
    ? publicReposRes.data
    : [];

  // PUBLIC PROFILES
  const { data: publicProfilesRes } = useQuery({
    queryKey: ["publicProfiles"],
    queryFn: getAllProfile,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const publicProfiles = Array.isArray(publicProfilesRes?.data)
    ? publicProfilesRes.data
    : [];

  useEffect(() => {
    if (userError?.message === "login" || userData?.status === "login") {
      setToast({
        message: "Session expired. Please log in again.",
        type: "error",
      });
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
    }

    if (userData?.username) {
      localStorage.setItem("username", userData.username);
    }
  }, [userError, userData, navigate, setIsAuthenticated]);

  function openOwnRepo(repoName) {
    navigate(`/repo/${repoName}`);
  }

  function getPublicRepo(repoName) {
    navigate(`/repo/public/${repoName}`);
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-200">
        <Navbar
          username={username}
          setIsAuthenticated={setIsAuthenticated}
          navigate={navigate}
        />

        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3">
            <div className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#ff006e]/30 p-6 shadow-2xl">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
                Dashboard
              </h2>
              <p className="text-gray-400 mt-2 text-sm">
                Welcome back, {username || "Developer"}.
              </p>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-4 py-3 border ${
                    activeTab === "overview"
                      ? "border-[#00d9ff]/40 bg-[#0d0221]/60"
                      : "border-[#ff006e]/20"
                  }`}
                >
                  Overview
                </button>

                <button
                  onClick={() => setActiveTab("myRepos")}
                  className={`w-full text-left px-4 py-3 border ${
                    activeTab === "myRepos"
                      ? "border-[#00d9ff]/40 bg-[#0d0221]/60"
                      : "border-[#ff006e]/20"
                  }`}
                >
                  My Repos
                </button>

                <button
                  onClick={() => setActiveTab("publicRepos")}
                  className={`w-full text-left px-4 py-3 border ${
                    activeTab === "publicRepos"
                      ? "border-[#00d9ff]/40 bg-[#0d0221]/60"
                      : "border-[#ff006e]/20"
                  }`}
                >
                  Public Repos
                </button>

                <button
                  onClick={() => setActiveTab("profiles")}
                  className={`w-full text-left px-4 py-3 border ${
                    activeTab === "profiles"
                      ? "border-[#00d9ff]/40 bg-[#0d0221]/60"
                      : "border-[#ff006e]/20"
                  }`}
                >
                  Profiles
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 md:col-span-9 space-y-8">
            {/* Overview */}
            {activeTab === "overview" && (           
            <section className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#00d9ff]/30 rounded-none p-8 shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between gap-4 mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#00d9ff] to-[#ff006e] bg-clip-text text-transparent">
                  Overview
                </h2>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/createRepo")}
                    className="px-5 py-3 bg-[#00d9ff]/20 border border-[#00d9ff]/30 text-sm font-semibold text-gray-200 hover:bg-[#00d9ff]/30 transition-all"
                  >
                    Create Repo
                  </button>
                  <button
                    onClick={() => navigate("/profile")}
                    className="px-5 py-3 bg-[#ff006e]/20 border border-[#ff006e]/30 text-sm font-semibold text-gray-200 hover:bg-[#ff006e]/30 transition-all"
                  >
                    My Profile
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="p-6 bg-[#0d0221]/60 border border-[#00d9ff]/20">
                  <p className="text-sm text-gray-400">Total Repositories</p>
                  <p className="text-4xl font-bold text-gray-100">{userRepo.length}</p>
                  <p className="text-xs text-gray-500 mt-2">All repos created by you.</p>
                </div>

                <div className="p-6 bg-[#0d0221]/60 border border-[#ff006e]/20">
                  <p className="text-sm text-gray-400">Total Stars</p>
                  <p className="text-4xl font-bold text-gray-100">
                    {userRepo.reduce((acc, repo) => acc + repo.starred.length, 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Stars received across your repos.</p>
                </div>

                <div className="p-6 bg-[#0d0221]/60 border border-[#00d9ff]/20">
                  <p className="text-sm text-gray-400">Public Repositories</p>
                  <p className="text-4xl font-bold text-gray-100">{publicRepos.length}</p>
                  <p className="text-xs text-gray-500 mt-2">Explore public repos from community.</p>
                </div>

                <div className="p-6 bg-[#0d0221]/60 border border-[#ff006e]/20">
                  <p className="text-sm text-gray-400">Public Profiles</p>
                  <p className="text-4xl font-bold text-gray-100">{publicProfiles.length}</p>
                  <p className="text-xs text-gray-500 mt-2">People sharing their projects publicly.</p>
                </div>
              </div>
            </section>

            )}

            {/* My Repos */}
            {activeTab === "myRepos" && (
              <section className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#ff006e]/30 p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[#ff006e]/20 to-[#00d9ff]/20">
                    <GitBranch className="w-6 h-6 text-[#ff006e]" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
                    My Repositories
                  </h2>
                </div>

                {userRepo.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">
                    You don’t have any repositories yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {userRepo.map((repo) => (
                      <div
                        onClick={() => openOwnRepo(repo.name)}
                        key={repo._id}
                        className="border border-[#ff006e]/20 bg-[#0d0221]/60 p-5 hover:border-[#ff006e]/60 transition-all cursor-pointer hover:shadow-lg hover:shadow-[#ff006e]/30 group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-100 group-hover:text-[#ff006e] transition-colors">
                            {repo.name}
                          </h3>
                          <span className="text-xs px-2 py-1 bg-gradient-to-r from-[#ff006e]/20 to-[#00d9ff]/20 text-gray-300 border border-[#ff006e]/30 font-medium">
                            {repo.visibility}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          {repo.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#ffbe0b]" />{" "}
                            {repo.starred.length}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Public Repos */}
            {activeTab === "publicRepos" && (
              <section className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#00d9ff]/30 p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[#00d9ff]/20 to-[#ff006e]/20">
                    <Users className="w-6 h-6 text-[#00d9ff]" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00d9ff] to-[#ff006e] bg-clip-text text-transparent">
                    Public Repositories
                  </h2>
                </div>

                {publicRepos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-[#0d0221]/60 border border-[#00d9ff]/20">
                    <p>No public Repos found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {publicRepos.map((repo) => (
                      <div
                        key={repo._id}
                        onClick={() => getPublicRepo(repo.name)}
                        className="border border-[#00d9ff]/20 bg-[#0d0221]/60 p-5 hover:border-[#00d9ff]/60 transition-all cursor-pointer hover:shadow-lg hover:shadow-[#00d9ff]/30 group"
                      >
                        <h3 className="font-semibold text-gray-100 group-hover:text-[#00d9ff] transition-colors mb-2">
                          {repo.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                          {repo.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#ffbe0b]" />{" "}
                            {repo.starred.length}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Profiles */}
            {activeTab === "profiles" && (
              <section className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#ff006e]/30 p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[#ff006e]/20 to-[#00d9ff]/20">
                    <User className="w-6 h-6 text-[#ff006e]" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">
                    Public Profiles
                  </h2>
                </div>

                {publicProfiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-[#0d0221]/60 border border-[#ff006e]/20">
                    <p>No public profiles found.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {publicProfiles.map((profile) => (
                      <div
                        key={profile._id}
                        onClick={() => {
                          navigate(`/publicProfile/${profile.username}`);
                        }}
                        className="flex items-start gap-3 p-4 border border-[#ff006e]/20 bg-[#0d0221]/60 hover:border-[#ff006e]/60 transition-all hover:shadow-lg hover:shadow-[#ff006e]/30 group cursor-pointer"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#ff006e]/20 to-[#00d9ff]/20 border border-[#ff006e]/30 flex-shrink-0 group-hover:border-[#ff006e]/60 transition-colors">
                          <User className="w-5 h-5 text-[#ff006e]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-100 group-hover:text-[#ff006e] transition-colors cursor-pointer text-sm">
                            {profile.username}
                          </h4>
                          <p className="text-xs text-gray-400 mb-1">
                            {profile.description || "No description provided."}
                          </p>
                          <div className="flex gap-3 text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                            <span>{profile.followedUser?.length || 0} following</span>
                            <span>{profile.followingUser?.length || 0} followers</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* AI Assistant */}
            <section className="bg-gradient-to-r from-[#1a1629]/90 to-[#0d0221]/90 backdrop-blur-xl border border-[#ffbe0b]/30 p-8 shadow-2xl text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-[#ffbe0b]/20 to-[#ff006e]/20">
                  <Bot className="w-7 h-7 text-[#ffbe0b]" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#ffbe0b] to-[#ff006e] bg-clip-text text-transparent">
                  AI Assistant
                </h2>
              </div>
              <p className="text-gray-300 max-w-xl mx-auto">
                🤖 Coming soon — JVCS Space AI Assistant to help you analyze commits,
                generate insights, and manage repositories smartly.
              </p>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}