import { useState } from "react";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login({ isAuthenticated, setIsAuthenticated }) {
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

      localStorage.setItem("email", formData.email);
      localStorage.setItem("username", formData.username);
      
      setIsAuthenticated(true);
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
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] flex items-center justify-center px-4 py-8 sm:py-12 text-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#ff006e]/30 rounded-none p-8 shadow-2xl hover:shadow-[0_0_50px_rgba(255,0,110,0.2)] transition-all duration-300">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ff006e] to-[#00d9ff] rounded-xl shadow-lg shadow-[#ff006e]/40 mb-4 transform hover:scale-110 transition-transform">
              <LogIn className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff006e] via-[#00d9ff] to-[#ffbe0b] bg-clip-text text-transparent mb-2">
              JVCS Space - Login
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Welcome back, developer! Let's code together.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full px-4 py-3 bg-[#0d0221]/60 border border-[#ff006e]/20 rounded-lg text-gray-100"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-4 py-3 bg-[#0d0221]/60 border border-[#00d9ff]/20 rounded-lg text-gray-100"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="Password"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0d0221]/60 border border-[#ff006e]/20 rounded-lg text-gray-100"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#ff006e] to-[#00d9ff] text-white font-semibold py-3 rounded-lg"
            >
              Sign in to JVCS
            </button>
          </form>

          <p className="text-center text-sm text-gray-300 mt-6">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-[#ff006e] font-semibold"
            >
              Create one
            </button>
          </p>
        </div>
      </div>

      {toast.show && (
        <div
          className={`fixed top-5 right-5 px-4 py-3 shadow-2xl backdrop-blur-xl border text-sm
          ${
            toast.type === "success"
              ? "bg-[#1a1629] border-[#00d9ff]/40 text-[#00d9ff]"
              : "bg-[#1a1629] border-[#ff006e]/40 text-[#ff006e]"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}