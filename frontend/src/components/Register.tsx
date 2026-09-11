import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://version-control-system-mebn.onrender.com/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setToast({
          show: true,
          message: data.message || "Registration failed",
          type: "error",
        });
        setLoading(false);
        return;
      }

      setToast({
        show: true,
        message: "Registration successful! Redirecting...",
        type: "success",
      });

      localStorage.setItem("email", formData.email);
      setTimeout(() => {
        navigate("/verifyOtp", { replace: true });
      }, 1200);
    } catch (err: any) {
      setToast({
        show: true,
        message: err.message || "Network error occurred",
        type: "error",
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3500);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col justify-center items-center px-4 py-12">
      {/* Top GitHub Logo */}
      <div className="flex flex-col items-center mb-6">
        <Link to="/" className="w-12 h-12 rounded-full bg-[#010409] text-white flex items-center justify-center shadow-md mb-4 hover:opacity-90 transition-opacity">
          <BookOpen className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-light text-[#1f2328] tracking-tight">
          Sign up for Girgit
        </h1>
      </div>

      {/* Main Register Card */}
      <div className="w-full max-w-[340px] sm:max-w-[360px] bg-white border border-[#d0d7de] rounded-md p-5 shadow-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-[#1f2328] mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-3 py-1.5 text-xs text-[#1f2328] focus:outline-none focus:border-[#0969da] focus:bg-white shadow-inner transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1f2328] mb-1">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-3 py-1.5 text-xs text-[#1f2328] focus:outline-none focus:border-[#0969da] focus:bg-white shadow-inner transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1f2328] mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-3 py-1.5 text-xs text-[#1f2328] focus:outline-none focus:border-[#0969da] focus:bg-white shadow-inner transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1f883d] hover:bg-[#1a7f37] text-white font-semibold text-xs py-2 rounded-md shadow-sm transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>

      {/* Sign In Sub-Card */}
      <div className="w-full max-w-[340px] sm:max-w-[360px] border border-[#d0d7de] rounded-md p-4 text-center text-xs bg-white mt-4 shadow-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-[#0969da] hover:underline font-semibold">
          Sign in
        </Link>
        .
      </div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 min-w-[280px] max-w-sm px-4 py-3 shadow-md rounded-md text-xs font-medium border ${
              toast.type === "success" 
                ? "bg-[#dafbe1] border-[#4ac26b] text-[#1a7f37]" 
                : "bg-[#ffebe9] border-[#ff8182] text-[#cf222e]"
            }`}
          >
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
