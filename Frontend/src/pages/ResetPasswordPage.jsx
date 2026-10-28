import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API = "http://localhost:3000";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] px-4 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]";

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">Invalid or missing reset link.</p>
          <button onClick={() => navigate("/forgot-password")}
            className="text-xs text-[#4dd9e8] border border-[rgba(77,217,232,0.3)] rounded-lg px-4 py-2 hover:bg-[rgba(77,217,232,0.08)] transition-all">
            Request a new link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="relative bg-[rgba(8,15,22,0.5)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] p-8 sm:p-10">

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-[10px] mb-3 text-[#8fd8dd] font-mono text-[0.75rem] font-bold tracking-[0.16em]">
              <div className="w-[26px] h-px bg-[#4dd9e8] shadow-[0_0_8px_rgba(77,217,232,0.8)]" />
              <span>ANARC</span>
              <div className="w-[26px] h-px bg-[#4dd9e8] shadow-[0_0_8px_rgba(77,217,232,0.8)]" />
            </div>
            <h1 className="text-2xl font-semibold text-[#e9eef2] tracking-tight">Reset Password</h1>
            <p className="text-[#96a3ad] text-sm mt-1">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">New Password</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} required
                  value={form.newPassword}
                  onChange={(e) => { setForm((f) => ({ ...f, newPassword: e.target.value })); setError(""); }}
                  placeholder="Enter new password"
                  className={inputClass + " pr-11"} />
                <button type="button" onClick={() => setShowNew((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55636d] hover:text-[#4dd9e8] transition-colors">
                  {showNew
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4M6.6 6.6C4 8.3 2 12 2 12s4 7 10 7c1.5 0 2.9-.4 4.1-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">Confirm Password</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} required
                  value={form.confirmPassword}
                  onChange={(e) => { setForm((f) => ({ ...f, confirmPassword: e.target.value })); setError(""); }}
                  placeholder="Confirm new password"
                  className={inputClass + " pr-11"} />
                <button type="button" onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55636d] hover:text-[#4dd9e8] transition-colors">
                  {showConfirm
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4M6.6 6.6C4 8.3 2 12 2 12s4 7 10 7c1.5 0 2.9-.4 4.1-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-red-400" />{error}
              </p>
            )}
            {success && (
              <p className="text-xs text-green-400 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-green-400" />{success}
              </p>
            )}

            <button type="submit" disabled={submitting}
              className="w-full rounded-xl border border-[rgba(94,234,240,0.32)] bg-[rgba(94,234,240,0.05)] py-3.5 text-sm font-semibold text-[#4dd9e8] tracking-wide transition-all duration-300 hover:bg-[rgba(94,234,240,0.10)] hover:border-[rgba(94,234,240,0.75)] hover:shadow-[0_0_20px_rgba(77,217,232,0.25)] disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}