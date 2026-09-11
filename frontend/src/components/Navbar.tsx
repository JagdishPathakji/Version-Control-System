import { GitBranch, LogOut, Search, Plus, Bell } from "lucide-react";
import handleLogout from "../functionalities/handleLogout";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { clearCache } from "../utils/apiCache";

interface NavbarProps {
  username?: string | null;
  setIsAuthenticated?: (value: boolean) => void;
  navigate?: any;
}

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
    "fixed top-4 right-4 z-50 px-4 py-3 rounded-md text-xs font-semibold shadow-lg border";
  const styles = {
    success: "bg-[#0d1117] border-[#238636] text-[#3fb950]",
    error: "bg-[#0d1117] border-[#f85149] text-[#f85149]",
    info: "bg-[#0d1117] border-[#388bfd] text-[#58a6ff]",
  };

  return (
    <div className={`${base} ${styles[type]}`}>
      {message}
    </div>
  );
}

export default function Navbar({
  username,
  setIsAuthenticated,
  navigate: propNavigate,
}: NavbarProps) {
  const defaultNavigate = useNavigate();
  const nav = propNavigate || defaultNavigate;
  const currentUsername = username || localStorage.getItem("username") || "User";

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const logout = async () => {
    const res = await handleLogout();

    if (res.status === true) {
      setToast({ message: res.message, type: "success" });
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      clearCache();
      if (setIsAuthenticated) {
        setIsAuthenticated(false);
      }

      setTimeout(() => {
        nav("/login", { replace: true });
      }, 800);
    } else {
      setToast({ message: `Logout Failed: ${res.message}`, type: "error" });
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="bg-[#010409] text-white border-b border-[#30363d] sticky top-0 z-50 px-4 py-2.5 text-sm font-normal">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left section: Logo + Search + Nav links */}
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard"
              className="flex items-center gap-2 text-white hover:text-gray-300 font-bold transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                <GitBranch className="w-5 h-5 text-[#010409]" />
              </div>
              <span className="font-semibold text-base tracking-tight hidden sm:inline">Girgit</span>
            </Link>

            {/* GitHub-style Search Bar */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-md px-2.5 py-1 text-xs text-gray-400 w-64 hover:border-gray-500 transition-colors cursor-text">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <span className="flex-1 text-gray-400">Type <kbd className="px-1 py-0.5 text-[10px] bg-[#21262d] border border-[#30363d] rounded text-gray-300 font-mono">/</kbd> to search</span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-gray-300">
              <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link to="/repo/new" className="hover:text-white transition-colors">New Repo</Link>
              <Link to={`/profile`} className="hover:text-white transition-colors">Profile</Link>
            </nav>
          </div>

          {/* Right section: Create Dropdown + Notifications + Profile Avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav("/repo/new")}
              title="Create new repository"
              className="flex items-center gap-1 px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-200 text-xs font-medium rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New</span>
            </button>

            <button
              title="Notifications"
              onClick={() => nav("/dashboard")}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#21262d] rounded-md transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Profile Avatar & Username */}
            <div 
              onClick={() => nav("/profile")}
              className="flex items-center gap-2 pl-2 border-l border-[#30363d] cursor-pointer group"
              title={`Logged in as ${currentUsername}`}
            >
              <div className="w-6 h-6 rounded-full bg-[#30363d] border border-[#8b949e] flex items-center justify-center text-white text-xs font-bold uppercase group-hover:border-white transition-colors">
                {currentUsername.charAt(0)}
              </div>
              <span className="text-xs text-gray-300 font-semibold hidden sm:inline group-hover:text-white transition-colors">
                {currentUsername}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#21262d] rounded-md transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>
    </>
  );
}