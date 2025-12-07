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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0f] via-[#0f1219] to-[#0a0b0f] flex items-center justify-center px-4 py-8 sm:py-12 text-gray-200">
      <div className="w-full max-w-md">
        <div className="bg-[#111217]/80 backdrop-blur-xl border border-[#1f2228]/50 rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_40px_rgba(90,240,177,0.1)] transition-all duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#5af0b1] to-[#3dd6ff] rounded-xl shadow-lg shadow-[#5af0b1]/30 mb-4 transform hover:scale-105 transition-transform">
              <UserPlus className="w-8 h-8 text-[#0a0b0f]" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#5af0b1] to-[#3dd6ff] bg-clip-text text-transparent mb-2">
              Join JVCS Space
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your next-gen version control awaits. Create your account today.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="group">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-300 mb-2 transition-colors group-focus-within:text-[#5af0b1]">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="choose_username"
                className="w-full px-4 py-3 bg-[#0f1116]/70 border border-[#2b2f35]/50 rounded-lg text-gray-100 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-[#5af0b1] focus:ring-2 focus:ring-[#5af0b1]/20 focus:bg-[#0f1116]"
                required
              />
            </div>

            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2 transition-colors group-focus-within:text-[#5af0b1]">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-[#0f1116]/70 border border-[#2b2f35]/50 rounded-lg text-gray-100 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-[#3dd6ff] focus:ring-2 focus:ring-[#3dd6ff]/20 focus:bg-[#0f1116]"
                required
              />
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2 transition-colors group-focus-within:text-[#5af0b1]">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#0f1116]/70 border border-[#2b2f35]/50 rounded-lg text-gray-100 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-[#5af0b1] focus:ring-2 focus:ring-[#5af0b1]/20 focus:bg-[#0f1116]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#5af0b1] to-[#3dd6ff] hover:from-[#6cf4c2] hover:to-[#63e0ff] text-[#0a0b0f] font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#5af0b1] focus:ring-offset-2 focus:ring-offset-[#0a0b0f] shadow-lg hover:shadow-[0_0_20px_rgba(90,240,177,0.4)]"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-[#1f2228] to-transparent" />
            <span className="text-xs text-gray-500">Already registered?</span>
            <div className="flex-1 h-px bg-gradient-to-l from-[#1f2228] to-transparent" />
          </div>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-[#5af0b1] hover:text-[#3dd6ff] font-semibold transition-colors duration-200 hover:underline underline-offset-2"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
