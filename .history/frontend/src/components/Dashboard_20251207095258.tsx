import { useNavigate } from "react-router-dom";
import getData from "../functionalities/getData";
import getRepo from "../functionalities/getRepo";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import getAllProfile from "../functionalities/getAllProfile";
import getAllRepo from "../functionalities/getAllRepo";
import { GitBranch, Star, Users, Bot, User } from "lucide-react";

export default function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const [userData, setUserData] = useState(null);
  const [userRepo, setUserRepo] = useState([]);
  const [publicRepos, setPublicRepos] = useState([]);
  const [publicProfiles, setPublicProfiles] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const user = await getData(email);
        if (user.status === "login") throw new Error("login");
        setUserData(user);
        localStorage.setItem("username", user.username);
        setUsername(user.username);

        const repos = await getRepo();
        if (repos.status === "login") throw new Error("login");
        setUserRepo(repos.data);

        const pubRepos = await getAllRepo();
        if (pubRepos.status === "login") throw new Error("login");
        setPublicRepos(pubRepos.data);

        const pubProfiles = await getAllProfile();
        if (pubProfiles.status === "login") throw new Error("login");
        setPublicProfiles(pubProfiles.data);
      } catch (err) {
        alert("Session expired or server error. Please log in again.");
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
      }
    };

    fetchAllData();
  }, [email, navigate, setIsAuthenticated]);

  function openOwnRepo(repoName: string) {
    navigate(`/repo/${repoName}`);
  }

  function getPublicRepo(repoName: string) {
    navigate(`/repo/public/${repoName}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] text-gray-200">
      <Navbar username={username} setIsAuthenticated={setIsAuthenticated} navigate={navigate}/>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* My Repositories */}
        <section className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#ff006e]/30 rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_50px_rgba(255,0,110,0.15)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-[#ff006e]/20 to-[#00d9ff]/20 rounded-lg">
              <GitBranch className="w-6 h-6 text-[#ff006e]" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent">My Repositories</h2>
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
                  className="border border-[#ff006e]/20 bg-[#0d0221]/60 rounded-xl p-5 hover:border-[#ff006e]/60 transition-all cursor-pointer hover:shadow-lg hover:shadow-[#ff006e]/30 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-100 group-hover:text-[#ff006e] transition-colors">{repo.name}</h3>
                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-[#ff006e]/20 to-[#00d9ff]/20 text-gray-300 rounded-full border border-[#ff006e]/30 font-medium">
                      {repo.visibility}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{repo.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#ffbe0b]" /> {repo.starred.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Public Repositories */}
        <section className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#00d9ff]/30 rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_50px_rgba(0,217,255,0.15)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-[#00d9ff]/20 to-[#ff006e]/20 rounded-lg">
              <Users className="w-6 h-6 text-[#00d9ff]" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00d9ff] to-[#ff006e] bg-clip-text text-transparent">Public Repositories</h2>
          </div>

          {publicRepos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-[#16181f] border border-[#1f2029] rounded-xl">
                <p>No public Repos found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {publicRepos.map((repo) => (
                <div
                  key={repo._id}
                  onClick={() => getPublicRepo(repo.name)}
                  className="border border-[#22232c] bg-[#16181f] rounded-xl p-5 hover:border-[#00ffd5] transition-all cursor-pointer hover:shadow-md hover:shadow-[#00ffd522]"
                >
                  <h3 className="font-semibold text-[#00ffd5] hover:underline mb-2">{repo.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{repo.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#00ffd5]" /> {repo.starred.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Public Profiles */}
          <div className="border-t border-[#1f2029] pt-6">
            <h3 className="text-xl font-semibold text-[#00ffd5] mb-4">Public Profiles</h3>

            {publicProfiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-[#16181f] border border-[#1f2029] rounded-xl">
                <p>No public profiles found.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {publicProfiles.map((profile) => (
                  <div
                    key={profile._id}
                    onClick={()=> {navigate(`/publicProfile/${profile.username}`)}}
                    className="flex items-start gap-3 p-4 border border-[#22232c] bg-[#16181f] rounded-lg hover:border-[#00ffd5] transition-all hover:shadow-md hover:shadow-[#00ffd522]"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-[#00ffd510] border border-[#00ffd5] rounded-full flex-shrink-0">
                      <User className="w-5 h-5 text-[#00ffd5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#00ffd5] hover:underline cursor-pointer text-sm">
                        {profile.username}
                      </h4>
                      <p className="text-xs text-gray-400 mb-1">
                        {profile.description || "No description provided."}
                      </p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>{profile.followedUser?.length || 0} following</span>
                        <span>{profile.followingUser?.length || 0} followers</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* AI Assistant Section */}
        <section className="bg-[#111217] border border-[#1f2029] rounded-2xl p-8 shadow-lg shadow-[#00ffd533] text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="w-7 h-7 text-[#00ffd5]" />
            <h2 className="text-2xl font-bold text-[#00ffd5]">AI Assistant</h2>
          </div>
          <p className="text-gray-400 max-w-xl mx-auto">
            🤖 Coming soon — JVCS Space AI Assistant to help you analyze commits, generate insights,
            and manage repositories smartly.
          </p>
        </section>
      </div>
    </div>
  );
}