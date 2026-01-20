import { useEffect, useState } from "react";
import { Code2, LogOut, User, BookOpen } from "lucide-react";
import handleLogout from "../functionalities/handleLogout";

interface NavbarProps {
  username?: string;
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

export default function Navbar({ username = "User", setIsAuthenticated, navigate }: NavbarProps) {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const handleLogoutClick = async () => {
    const res = await handleLogout(setIsAuthenticated, navigate);

    if (res.status === true) {
      setToast({ message: res.message, type: "success" });
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
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

      <nav className="bg-gradient-to-r from-[#0d0221] via-[#1a1629] to-[#0d0221] border-b border-[#ff006e]/30 sticky top-0 z-50 shadow-lg shadow-[#ff006e]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#ff006e] to-[#00d9ff] rounded-lg shadow-lg shadow-[#ff006e]/40 hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6 text-white" onClick={()=> {navigate("/dashboard")}} style={{cursor:"pointer"}} />
              </div>
              <span className="text-xl font-mono font-bold bg-gradient-to-r from-[#ff006e] to-[#00d9ff] bg-clip-text text-transparent" onClick={()=> {navigate("/dashboard")}} style={{cursor:"pointer"}}>
                JVCS Space
              </span>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/documentation")}
                className="text-sm text-gray-300 hover:text-[#00d9ff] transition-colors duration-200 p-2 hover:bg-[#00d9ff]/10 rounded-lg flex items-center gap-1"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Docs</span>
              </button>
              <span className="text-sm text-gray-300 hidden sm:block hover:text-[#ff006e] transition-colors cursor-pointer" onClick={()=>{navigate("/profile")}}>
                {username}
              </span>
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#ff006e]/20 to-[#00d9ff]/20 rounded-full border border-[#ff006e]/30 hover:border-[#ff006e]/60 transition-all" style={{cursor:"pointer"}} onClick={()=>{navigate("/profile")}}>
                <User className="w-5 h-5 text-[#ff006e]" />
              </div>
              <button
                onClick={handleLogoutClick}
                className="ml-3 text-gray-400 hover:text-[#ff006e] transition-colors duration-200 p-2 hover:bg-[#ff006e]/10 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
