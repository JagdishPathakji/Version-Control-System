import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // success | error
  });

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(
      "https://version-control-system-mebn.onrender.com/signup",
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

      setTimeout(() => {
        navigate("/verifyOtp", { replace: true });
      }, 1500);
    } else if (data.status === "user") {
      setToast({
        show: true,
        message: data.message,
        type: "error",
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } else {
      setToast({
        show: true,
        message: data.message,
        type: "error",
      });

      setTimeout(() => {
        navigate("/register", { replace: true });
      }, 1500);
    }

    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
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
        <div className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#ff006e]/30 rounded-none p-8 shadow-2xl hover:shadow-[0_0_50px_rgba(255,0,110,0.2)] transition-all duration-300">
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
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="your_username"
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
                placeholder="you@example.com"
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
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#0d0221]/60 border border-[#ff006e]/20 rounded-lg text-gray-100"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#ff006e] to-[#00d9ff] text-white font-semibold py-3 rounded-lg"
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
              className="text-[#ff006e] font-semibold"
            >
              Log in
            </button>
          </p>
        </div>
      </div>

      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 min-w-[280px] px-5 py-4 backdrop-blur-xl border shadow-2xl
            ${
              toast.type === "success"
                ? "bg-[#0d0221]/90 border-[#00d9ff]/50 shadow-[0_0_30px_rgba(0,217,255,0.25)]"
                : "bg-[#0d0221]/90 border-[#ff006e]/50 shadow-[0_0_30px_rgba(255,0,110,0.25)]"
            }`}
          >
            <div
              className={`w-1 h-full ${
                toast.type === "success" ? "bg-[#00d9ff]" : "bg-[#ff006e]"
              }`}
            />
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full font-bold
              ${
                toast.type === "success"
                  ? "bg-[#00d9ff]/20 text-[#00d9ff]"
                  : "bg-[#ff006e]/20 text-[#ff006e]"
              }`}
            >
              {toast.type === "success" ? "✓" : "!"}
            </div>
            <p className="text-sm text-gray-200">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}