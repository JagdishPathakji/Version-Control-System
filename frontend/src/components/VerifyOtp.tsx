import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Otp() {
  const [formData, setFormData] = useState({ otp: "", email: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      const response = await fetch("https://version-control-system-mebn.onrender.com/verifyEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data);

      if (data.status === true) {
        alert(data.message);
        navigate("/login");
      } else if (data.status === "user") {
        alert(data.message);
        navigate("/register", { replace: true });
      } else {
        alert(data.message);
        navigate("/verifyOtp", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while verifying OTP.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] flex items-center justify-center px-4 py-8 sm:py-12 text-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#00d9ff]/30 rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_50px_rgba(0,217,255,0.2)] transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00d9ff] to-[#ff006e] rounded-xl shadow-lg shadow-[#00d9ff]/40 mb-4 transform hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00d9ff] via-[#ff006e] to-[#ffbe0b] bg-clip-text text-transparent mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm font-medium text-center">{error}</p>
              </div>
            )}

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 transition-colors group-focus-within:text-[#00d9ff]">
                Registered Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0d0221]/60 border border-[#00d9ff]/20 rounded-lg text-gray-100 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-[#00d9ff] focus:ring-2 focus:ring-[#00d9ff]/30 focus:bg-[#0d0221]"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 transition-colors group-focus-within:text-[#ff006e]">
                Verification Code
              </label>
              <input
                type="text"
                name="otp"
                placeholder="000000"
                maxLength={6}
                value={formData.otp}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0d0221]/60 border border-[#ff006e]/20 rounded-lg text-center text-2xl font-bold tracking-widest text-gray-100 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-[#ff006e] focus:ring-2 focus:ring-[#ff006e]/30 focus:bg-[#0d0221]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00d9ff] to-[#ff006e] hover:from-[#1ae5ff] hover:to-[#ff1a7e] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#00d9ff] focus:ring-offset-2 focus:ring-offset-[#0d0221] shadow-lg hover:shadow-[0_0_25px_rgba(0,217,255,0.5)]"
            >
              Verify Code
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-[#00d9ff]/30 to-transparent" />
            <span className="text-xs text-gray-500">Secure</span>
            <div className="flex-1 h-px bg-gradient-to-l from-[#00d9ff]/30 to-transparent" />
          </div>

          {/* Footer */}
          <div className="text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-[#00d9ff] hover:text-[#ff006e] font-semibold text-sm transition-colors duration-200 hover:underline underline-offset-2"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
