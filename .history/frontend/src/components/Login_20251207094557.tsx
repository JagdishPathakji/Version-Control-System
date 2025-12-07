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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("https://version-control-system-mebn.onrender.com/login", {
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
      localStorage.setItem("email", formData.email);
      localStorage.setItem("username", formData.username);
      setIsAuthenticated(true);
    } else {
      alert(data.message);
      navigate("/login", { replace: true });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0f] via-[#0f1219] to-[#0a0b0f] flex items-center justify-center px-4 py-8 sm:py-12 text-gray-200">
      <div className="w-full max-w-md">
        <div className="bg-[#111217]/80 backdrop-blur-xl border border-[#1f2228]/50 rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_40px_rgba(90,240,177,0.1)] transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#5af0b1] to-[#3dd6ff] rounded-xl shadow-lg shadow-[#5af0b1]/30 mb-4 transform hover:scale-105 transition-transform">
              <LogIn className="w-8 h-8 text-[#0a0b0f]" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#5af0b1] to-[#3dd6ff] bg-clip-text text-transparent mb-2">
              JVCS Space
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Welcome back, developer! Enter your credentials to continue.
            </p>
          </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full px-3 py-2 bg-[#0f1116] border border-[#2b2f35] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5af0b1] focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 bg-[#0f1116] border border-[#2b2f35] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3dd6ff] focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 bg-[#0f1116] border border-[#2b2f35] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5af0b1] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <a
              href="#"
              className="text-[#3dd6ff] hover:text-[#5af0b1] font-medium transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#5af0b1] to-[#3dd6ff] hover:from-[#6cf4c2] hover:to-[#63e0ff] text-black font-semibold py-2.5 px-4 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5af0b1] focus:ring-offset-2 focus:ring-offset-[#0a0b0f]"
          >
            Log in
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            Don’t have an account?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-[#5af0b1] hover:text-[#3dd6ff] font-semibold hover:underline"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}
