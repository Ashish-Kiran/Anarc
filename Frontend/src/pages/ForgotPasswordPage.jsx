import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Something went wrong");
      setSuccess(data.message);
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] px-4 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]";

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="relative bg-[rgba(8,15,22,0.5)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] p-8 sm:p-10">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-[10px] mb-3 text-[#8fd8dd] font-mono text-[0.75rem] font-bold tracking-[0.16em]">
              <div className="w-[80px] h-px bg-[linear-gradient(to_right,transparent,rgba(77,217,232,0.8),white)]" />
              <span className="text-[#8fd8dd] font-mono text-[0.75rem] font-bold tracking-[0.16em] whitespace-nowrap">
                ANARC
              </span>
              <div className="w-[80px] h-px bg-[linear-gradient(to_left,transparent,rgba(77,217,232,0.8),white)]" />
            </div>
            <h1 className="text-2xl font-semibold text-[#e9eef2] tracking-tight">
              Forgot Password
            </h1>
            <p className="text-[#96a3ad] text-sm mt-1">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Enter your email"
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                {error}
              </p>
            )}
            {success && (
              <p className="text-xs text-green-400 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-green-400" />
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl border border-[rgba(94,234,240,0.32)] bg-[rgba(94,234,240,0.05)] py-3.5 text-sm font-semibold text-[#4dd9e8] tracking-wide transition-all duration-300 hover:bg-[rgba(94,234,240,0.10)] hover:border-[rgba(94,234,240,0.75)] hover:shadow-[0_0_20px_rgba(77,217,232,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-center text-sm text-[#96a3ad] hover:text-[#4dd9e8] transition-colors"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
