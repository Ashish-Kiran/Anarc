import React, { useState } from "react";
import ANARC from "./../assets/AnarcLogo.png";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";

export default function LoginPage() {
  const [role, setRole] = useState("member");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      if (role === "admin" && data.user.siteRole !== "ADMIN") {
        setError("You do not have admin access");
        return;
      }
      if (role === "member" && data.user.siteRole === "ADMIN") {
        setError("Please use the Admin tab to log in");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.siteRole === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Glass card */}
        <div className="relative bg-[rgba(8,15,22,0.5)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] p-8 sm:p-10">
          {/* Logo above card */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={ANARC}
              alt="ANARC Logo"
              className="w-16 h-16 object-contain"
            />
          </div>

          {/* Close button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Go back"
          >
            ×
          </button>

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-[10px] mb-3 text-[#8fd8dd] font-mono text-[0.75rem] font-bold tracking-[0.16em]">
              <div className="w-[26px] h-0px bg-[#d99a5b] shadow-[0_0_8px_rgba(217,154,91,0.8)]" />
              <span>ANARC</span>
              <div className="w-[26px] h-0px bg-[#d99a5b] shadow-[0_0_8px_rgba(217,154,91,0.8)]" />
            </div>
            <h1 className="text-2xl font-semibold text-[#e9eef2] tracking-tight">
              Welcome back
            </h1>
            <p className="text-[#96a3ad] text-sm mt-1">
              Sign in to your account
            </p>
          </div>

          {/* Role toggle */}
          <div className="mb-7">
            <div className="relative grid grid-cols-2 rounded-xl border border-[rgba(94,234,240,0.2)] bg-black/20 p-1">
              <button
                type="button"
                onClick={() => {
                  setRole("member");
                  setError("");
                }}
                className={`relative z-10 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors duration-300 ${
                  role === "member"
                    ? "text-[#0a0e14]"
                    : "text-[#96a3ad] hover:text-[#e9eef2]"
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("admin");
                  setError("");
                }}
                className={`relative z-10 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors duration-300 ${
                  role === "admin"
                    ? "text-[#0a0e14]"
                    : "text-[#96a3ad] hover:text-[#e9eef2]"
                }`}
              >
                <ShieldIcon className="w-4 h-4" />
                Admin
              </button>
              {/* Sliding highlight */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-[#4dd9e8] shadow-[0_0_16px_rgba(77,217,232,0.4)] transition-transform duration-300 ease-out ${
                  role === "admin"
                    ? "translate-x-[calc(100%+8px)]"
                    : "translate-x-1"
                }`}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                {role === "admin" ? "Admin Email" : "Email Address"}
              </label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55636d]" />
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] pl-11 pr-4 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                Password
              </label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55636d]" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] pl-11 pr-11 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55636d] hover:text-[#4dd9e8] transition-colors"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {error}
                </p>
              )}
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-[#96a3ad] cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-[rgba(138,164,178,0.3)] bg-transparent accent-[#4dd9e8]"
                />
                Remember me
              </label>
              <a
                href="/forgot-password"
                className="text-xs text-[#96a3ad] hover:text-[#4dd9e8] transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border border-[rgba(94,234,240,0.32)] bg-[rgba(94,234,240,0.05)] py-3.5 text-sm font-semibold text-[#4dd9e8] tracking-wide transition-all duration-300 hover:bg-[rgba(94,234,240,0.10)] hover:border-[rgba(94,234,240,0.75)] hover:shadow-[0_0_20px_rgba(77,217,232,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Signing in..."
                : `Sign In as ${role === "admin" ? "Admin" : "Member"}`}
            </button>

            {/* Footer */}
            <p className="text-center text-sm text-[#96a3ad]">
              Don't have an account?{" "}
              <a
                href="/apply"
                className="text-[#4dd9e8] hover:text-[#7ee4ef] font-medium transition-colors"
              >
                Apply to join
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function LockIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function UserIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}
function ShieldIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </svg>
  );
}
function MailIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
function EyeIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4M6.6 6.6C4 8.3 2 12 2 12s4 7 10 7c1.5 0 2.9-.4 4.1-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
