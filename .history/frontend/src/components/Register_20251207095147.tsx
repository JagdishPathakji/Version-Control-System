import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("https://version-control-system-mebn.onrender.com/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    console.log(data);

    if (data.status === true) {
      alert(data.message);
      navigate("/verifyOtp", { replace: true });
    } else if (data.status === "user") {
      alert(data.message);
      navigate("/login", { replace: true });
    } else {
      alert(data.message);
      navigate("/register", { replace: true });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSwitchToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] flex items-center justify-center px-4 py-8 sm:py-12 text-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#ff006e]/30 rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_50px_rgba(255,0,110,0.2)] transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ff006e] to-[#00d9ff] rounded-xl shadow-lg shadow-[#ff006e]/40 mb-4 transform hover:scale-110 transition-transform">
              <UserPlus className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff006e] via-[#00d9ff] to-[#ffbe0b] bg-clip-text text-transparent mb-2">
              Join JVCS
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Create your account and start collaborating today
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="group">
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-200 mb-2 transition-colors group-focus-within:text-[#ff006e]"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="your_username"
                className="w-full px-4 py-3 bg-[#0d0221]/60 border border-[#ff006e]/20 rounded-lg text-gray-100 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-[#ff006e] focus:ring-2 focus:ring-[#ff006e]/30 focus:bg-[#0d0221]"
                required
              />
            </div>

            <div className="group">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-200 mb-2 transition-colors group-focus-within:text-[#00d9ff]"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-[#0d0221]/60 border border-[#00d9ff]/20 rounded-lg text-gray-100 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-[#00d9ff] focus:ring-2 focus:ring-[#00d9ff]/30 focus:bg-[#0d0221]"
                required
              />
            </div>

            <div className="group">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-200 mb-2 transition-colors group-focus-within:text-[#ff006e]"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#0d0221]/60 border border-[#ff006e]/20 rounded-lg text-gray-100 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-[#ff006e] focus:ring-2 focus:ring-[#ff006e]/30 focus:bg-[#0d0221]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#ff006e] to-[#00d9ff] hover:from-[#ff1a7e] hover:to-[#1ae5ff] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#ff006e] focus:ring-offset-2 focus:ring-offset-[#0d0221] shadow-lg hover:shadow-[0_0_25px_rgba(255,0,110,0.5)]"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-[#ff006e]/30 to-transparent" />
            <span className="text-xs text-gray-500">Or continue with email</span>
            <div className="flex-1 h-px bg-gradient-to-l from-[#ff006e]/30 to-transparent" />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-300">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-[#ff006e] hover:text-[#00d9ff] font-semibold transition-colors duration-200 hover:underline underline-offset-2"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
