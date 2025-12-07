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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0f] via-[#0f1219] to-[#0a0b0f] flex items-center justify-center px-4 py-8 sm:py-12 text-gray-200">
      <div className="w-full max-w-md">
        <div className="bg-[#111217]/80 backdrop-blur-xl border border-[#1f2228]/50 rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_40px_rgba(90,240,177,0.1)] transition-all duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#5af0b1] to-[#3dd6ff] rounded-xl shadow-lg shadow-[#5af0b1]/30 mb-4 transform hover:scale-105 transition-transform">
              <ShieldCheck className="w-8 h-8 text-[#0a0b0f]" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#5af0b1] to-[#3dd6ff] bg-clip-text text-transparent mb-2">
              JVCS Space
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Enter the verification code sent to your email
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center text-sm font-medium">
                {error}
              </div>
            )}

            <div className="group">
              <label className="block text-sm font-semibold text-gray-300 mb-2 transition-colors group-focus-within:text-[#5af0b1]">
                Registered Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0f1116]/70 border border-[#2b2f35]/50 rounded-lg text-gray-100 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-[#5af0b1] focus:ring-2 focus:ring-[#5af0b1]/20 focus:bg-[#0f1116] text-center"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-300 mb-2 transition-colors group-focus-within:text-[#5af0b1]">
                Verification Code
              </label>
              <input
                type="text"
                name="otp"
                placeholder="000000"
                value={formData.otp}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0f1116]/70 border border-[#2b2f35]/50 rounded-lg text-gray-100 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-[#3dd6ff] focus:ring-2 focus:ring-[#3dd6ff]/20 focus:bg-[#0f1116] text-center text-lg font-semibold tracking-widest"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#5af0b1] to-[#3dd6ff] hover:from-[#6cf4c2] hover:to-[#63e0ff] text-[#0a0b0f] font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#5af0b1] focus:ring-offset-2 focus:ring-offset-[#0a0b0f] shadow-lg hover:shadow-[0_0_20px_rgba(90,240,177,0.4)]"
            >
              Verify Code
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-[#5af0b1] hover:text-[#3dd6ff] font-semibold text-sm transition-colors hover:underline underline-offset-2"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
