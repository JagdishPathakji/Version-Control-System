import { useState } from "react";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login({ isAuthenticated: _isAuthenticated, setIsAuthenticated }: { isAuthenticated?: boolean; setIsAuthenticated: (value: boolean) => void }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(
      "https://version-control-system-mebn.onrender.com/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();
    console.log(data);

    if (data.status === true) {
      setToast({
        show: true,
        message: data.message,
        type: "success",
      });

      localStorage.setItem("email", data.email || formData.email.toLowerCase().trim());
      localStorage.setItem("username", data.username || formData.username.toLowerCase().trim());

      setTimeout(() => {
        setIsAuthenticated(true);
      }, 1500)

    } else {
      setToast({
        show: true,
        message: data.message,
        type: "error",
      });

      navigate("/login", { replace: true });
    }

    setTimeout(() => {
      setToast({ ...toast, show: false });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSwitchToRegister = () => {
    navigate("/register", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full flex flex-col md:flex-row bg-white rounded-lg shadow-2xl overflow-hidden min-h-[550px]">
        
        {/* Left Side (Theme) */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#3023ae] to-[#b428b4] p-10 flex flex-col justify-center relative overflow-hidden text-white hidden md:flex">
          <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-400 rounded-full mix-blend-screen opacity-50 blur-xl"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-500 rounded-full mix-blend-screen opacity-30 blur-2xl"></div>
          <div className="absolute bottom-20 left-10 w-24 h-24 bg-fuchsia-500 rounded-full mix-blend-screen opacity-50 blur-xl"></div>
          
          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-full shadow-lg mb-6 border border-white/20">
              <LogIn className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome Page</h2>
            <p className="text-purple-200">Sign in to<br/>continue access</p>
          </div>
        </div>

        {/* Right Side (Original Form) */}
        <div className="md:w-1/2 bg-white p-8 sm:p-12 flex flex-col justify-center">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#b428b4] to-[#3023ae] bg-clip-text text-transparent mb-2">
              Girgit Hub - Login
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Welcome back, developer! Let's code together.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full border-b border-gray-300 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#b428b4] transition-colors bg-transparent"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border-b border-gray-300 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#b428b4] transition-colors bg-transparent"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="Password"
                onChange={handleChange}
                className="w-full border-b border-gray-300 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#b428b4] transition-colors bg-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#3023ae] to-[#b428b4] text-white font-semibold py-3 flex justify-between px-6 items-center rounded-sm hover:opacity-90 transition-opacity shadow-md mt-4"
            >
              <span>Sign in to Girgit Hub</span>
              <span>&gt;</span>
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-[#b428b4] font-semibold hover:underline"
            >
              Create one
            </button>
          </p>
        </div>
      </div>

      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 min-w-[280px] max-w-sm px-5 py-4 shadow-xl border-l-4
            ${toast.type === "success" ? "bg-white border-green-500 text-green-700" : "bg-white border-red-500 text-red-700"}`}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}

    </div>
  );
}