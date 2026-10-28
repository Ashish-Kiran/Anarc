import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

function ActionBtn({ onClick, color = "cyan", children, disabled }) {
  const colors = {
    cyan: "border-[rgba(94,234,240,0.32)] text-[#4dd9e8] hover:bg-[rgba(94,234,240,0.10)] hover:border-[rgba(94,234,240,0.75)] hover:shadow-[0_0_16px_rgba(77,217,232,0.2)]",
    amber:
      "border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-xs px-3 py-1.5 rounded-xl border font-semibold tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${colors[color]}`}
    >
      {children}
    </button>
  );
}

function FormError({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-red-400 flex items-center gap-1.5">
      <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
      {msg}
    </p>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-4 h-4"
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-4 h-4"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4M6.6 6.6C4 8.3 2 12 2 12s4 7 10 7c1.5 0 2.9-.4 4.1-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    batch: "",
    orgRole: "",
    instagram: "",
    linkedin: "",
    github: "",
  });
  const [photoUploading, setPhotoUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ── Password state ──
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (!token || !storedUser) {
        navigate("/login");
        return;
      }
      const u = JSON.parse(storedUser);
      setUser(u);
      setForm({
        name: u.name || "",
        batch: u.batch || "",
        orgRole: u.orgRole || "",
        instagram: u.instagram || "",
        linkedin: u.linkedin || "",
        github: u.github || "",
      });
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", preset);
      body.append("folder", "Anarc/members");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body },
      );
      const data = await res.json();
      if (!res.ok) throw new Error("Something went wrong");

      const updateRes = await fetch(`${API}/me`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ photo: data.secure_url }),
      });
      const updated = await updateRes.json();
      if (!updateRes.ok) throw new Error("Something went wrong");

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, photo: updated.photo }),
      );
      setUser((u) => ({ ...u, photo: updated.photo }));
    } catch {
      setError("Something went wrong");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API}/me`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error("Something went wrong");
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, ...updated }));
      setUser((u) => ({ ...u, ...updated }));
      setSuccess("Profile updated successfully");
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    setPasswordSubmitting(true);
    try {
      const res = await fetch(`${API}/me`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setPasswordSuccess("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordSection(false);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] px-4 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]";

  if (!user) return null;

  return (
    <div className="min-h-screen w-full flex items-start justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="relative bg-[rgba(8,15,22,0.5)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] p-8 sm:p-10">
          {/* ── Close button ── */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>

          {/* ── Header ── */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-[80px] h-px bg-[linear-gradient(to_right,transparent,rgba(77,217,232,0.8),white)]" />
            <span className="text-[#8fd8dd] font-mono text-[0.75rem] font-bold tracking-[0.16em] whitespace-nowrap">
              ANARC · PROFILE
            </span>
            <div className="w-[80px] h-px bg-[linear-gradient(to_left,transparent,rgba(77,217,232,0.8),white)]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#e9eef2] tracking-tight mb-8">
            Your Profile
          </h1>

          {/* ── Photo ── */}
          <div className="flex items-center gap-5 mb-8 pb-8 border-b border-[rgba(94,234,240,0.08)]">
            <div className="relative flex-shrink-0">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[rgba(94,234,240,0.3)]"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[rgba(77,217,232,0.1)] border-2 border-[rgba(94,234,240,0.3)] flex items-center justify-center text-[#4dd9e8] text-xl font-semibold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )}
              {photoUploading && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full border-2 border-[#4dd9e8] border-t-transparent animate-spin" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-[#e9eef2]">{user.name}</p>
              <p className="text-xs text-[#55636d]">{user.email}</p>
              <label className="cursor-pointer text-xs text-[#4dd9e8] border border-[rgba(77,217,232,0.3)] rounded-lg px-3 py-1.5 hover:bg-[rgba(77,217,232,0.08)] transition-all duration-200 w-fit">
                {photoUploading ? "Uploading..." : "Change Photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={photoUploading}
                />
              </label>
            </div>
          </div>

          {/* ── Info fields ── */}
          <div className="flex flex-col gap-5 mb-8 pb-8 border-b border-[rgba(94,234,240,0.08)]">
            {/* Read-only */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-[#55636d]">
                  Email
                </label>
                <div className="rounded-xl border border-[rgba(138,164,178,0.1)] bg-[rgba(7,12,18,0.3)] px-4 py-3.5 text-sm text-[#55636d] truncate">
                  {user.email}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-[#55636d]">
                  Role
                </label>
                <div className="rounded-xl border border-[rgba(138,164,178,0.1)] bg-[rgba(7,12,18,0.3)] px-4 py-3.5 text-sm text-[#55636d]">
                  {user.siteRole}
                </div>
              </div>
            </div>

            {/* Editable */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Your full name"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                  Batch
                </label>
                <input
                  type="text"
                  value={form.batch}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, batch: e.target.value }))
                  }
                  placeholder="e.g. 2023"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                  Club Role
                </label>
                <input
                  type="text"
                  value={form.orgRole}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, orgRole: e.target.value }))
                  }
                  placeholder="e.g. Core Member"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                GitHub
              </label>
              <input
                type="text"
                value={form.github}
                onChange={(e) =>
                  setForm((f) => ({ ...f, github: e.target.value }))
                }
                placeholder="https://github.com/..."
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                LinkedIn
              </label>
              <input
                type="text"
                value={form.linkedin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, linkedin: e.target.value }))
                }
                placeholder="https://linkedin.com/in/..."
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                Instagram
              </label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) =>
                  setForm((f) => ({ ...f, instagram: e.target.value }))
                }
                placeholder="https://instagram.com/..."
                className={inputClass}
              />
            </div>

            {error && <FormError msg={error} />}
            {success && (
              <p className="text-xs text-green-400 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-green-400" />
                {success}
              </p>
            )}

            <ActionBtn onClick={handleSave} color="cyan" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </ActionBtn>
          </div>

          {/* ── Password Section ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <ActionBtn
                onClick={() => {
                  setShowPasswordSection((s) => !s);
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                color="amber"
              >
                {showPasswordSection ? "Cancel" : "Change Password"}
              </ActionBtn>
              <a
                href="/forgot-password"
                className="text-xs text-[#4dd9e8] hover:underline transition-colors"
              >
                Forgot?
              </a>
            </div>

            {showPasswordSection && (
              <div className="flex flex-col gap-4 p-4 rounded-xl border border-[rgba(138,164,178,0.15)] bg-[rgba(7,12,18,0.4)]">
                {/* Current */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((f) => ({
                          ...f,
                          currentPassword: e.target.value,
                        }))
                      }
                      placeholder="Enter current password"
                      className={inputClass + " pr-11"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((s) => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55636d] hover:text-[#4dd9e8] transition-colors"
                    >
                      {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* New */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((f) => ({
                          ...f,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="Enter new password"
                      className={inputClass + " pr-11"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55636d] hover:text-[#4dd9e8] transition-colors"
                    >
                      {showNew ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((f) => ({
                          ...f,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Confirm new password"
                      className={inputClass + " pr-11"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55636d] hover:text-[#4dd9e8] transition-colors"
                    >
                      {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {passwordError && <FormError msg={passwordError} />}
                {passwordSuccess && (
                  <p className="text-xs text-green-400 flex items-center gap-1.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-green-400" />
                    {passwordSuccess}
                  </p>
                )}

                <ActionBtn
                  onClick={handlePasswordChange}
                  color="cyan"
                  disabled={passwordSubmitting}
                >
                  {passwordSubmitting ? "Updating..." : "Update Password"}
                </ActionBtn>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
