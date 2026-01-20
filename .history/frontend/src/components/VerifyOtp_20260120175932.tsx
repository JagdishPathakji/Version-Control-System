import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* =======================
   Toast Component
======================= */
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

export default function Otp() {
  const [formData, setFormData] = useState({ otp: "", email: "" });
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

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
      const response = await fetch(
        "https://version-control-system-mebn.onrender.com/verifyEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      console.log(data);

      if (data.status === true) {
        setToast({ message: data.message, type: "success" });
        setTimeout(() => navigate("/login"), 1200);
      } else if (data.status === "user") {
        setToast({ message: data.message, type: "info" });
        setTimeout(() => navigate("/register", { replace: true }), 1200);
      } else {
        setToast({ message: data.message, type: "error" });
        setTimeout(() => navigate("/verifyOtp", { replace: true }), 1200);
      }
    } catch (err) {
      console.error(err);
      setToast({
        message: "An error occurred while verifying OTP.",
        type: "error",
      });
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

      <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#1a1629] to-[#0d0221] flex items-center justify-center px-4 py-8 sm:py-12 text-gray-100">
        <div className="w-full max-w-md">
          {/* 🔲 Square Box */}
          <div className="bg-[#1a1629]/90 backdrop-blur-xl border border-[#00d9ff]/30 p-8 shadow-2xl hover:shadow-[0_0_50px_rgba(0,217,255,0.2)] transition-all duration-300">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00d9ff] to-[#ff006e] shadow-lg shadow-[#00d9ff]/40 mb-4">
                <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00d9ff] via-[#ff006e] to-[#ffbe0b] bg-clip-text text-transparent mb-2">
                Verify Your Email
              </h1>
              <p className="text-gray-300 text-sm">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 text-sm font-medium text-center">
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Registered Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="Email"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0d0221]/60 border border-[#00d9ff]/20 text-gray-100 focus:outline-none focus:border-[#00d9ff]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  name="otp"
                  maxLength={6}
                  placeholder="OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0d0221]/60 border border-[#ff006e]/20 text-center text-2xl font-bold tracking-widest text-gray-100 focus:outline-none focus:border-[#ff006e]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00d9ff] to-[#ff006e] text-white font-semibold py-3 shadow-lg hover:shadow-[0_0_25px_rgba(0,217,255,0.5)]"
              >
                Verify Code
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate("/login")}
                className="text-[#00d9ff] hover:text-[#ff006e] font-semibold text-sm"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}