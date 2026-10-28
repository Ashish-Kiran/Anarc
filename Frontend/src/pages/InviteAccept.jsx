import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  UserIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  LinkIcon,
} from "lucide-react";
import ANARC from "../assets/AnarcLogo.png"; // adjust path if needed

export default function InviteAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [inviteInfo, setInviteInfo] = useState(null); // { name, email }
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(true);

  const [form, setForm] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    batch: "",
    instagram: "",
    linkedin: "",
    github: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Verify token on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setVerifyError("No invite token found in the link.");
      setVerifying(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/invite/verify?token=${token}`
        );
        const data = await res.json();
        if (!res.ok || !data.valid) {
          setVerifyError(data.error || "Invalid invite link.");
        } else {
          setInviteInfo({ name: data.name, email: data.email });
          setForm((f) => ({ ...f, name: data.name }));
        }
      } catch {
        setVerifyError("Could not reach the server. Please try again.");
      } finally {
        setVerifying(false);
      }
    })();
  }, [token]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
    setUploading(true);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", preset);
      body.append("folder", "Anarc/members");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Image upload failed");
      setPhotoUrl(data.secure_url);
    } catch (err) {
      setError(err.message);
      setPhoto(null);
      setPhotoPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (uploading) {
      setError("Please wait for the photo to finish uploading.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/invite/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            name: form.name.trim(),
            password: form.password,
            batch: form.batch.trim(),
            instagram: form.instagram.trim(),
            linkedin: form.linkedin.trim(),
            github: form.github.trim(),
            photo: photoUrl || null,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Verifying state ────────────────────────────────────────────────────
  if (verifying) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-[#8fd8dd] font-mono text-sm animate-pulse">
          Verifying your invite link...
        </p>
      </div>
    );
  }

  // ── Invalid token state ────────────────────────────────────────────────
  if (verifyError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4">
        <div className="relative bg-[rgba(8,15,22,0.5)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08)] backdrop-blur-[20px] p-10 max-w-md w-full text-center">
          <img src={ANARC} alt="ANARC" className="w-14 h-14 object-contain mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-[#e9eef2] mb-3">
            Invalid Invite
          </h2>
          <p className="text-[#96a3ad] text-sm">{verifyError}</p>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="relative bg-[rgba(8,15,22,0.5)] border border-[rgba(94,234,240,0.32)] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.3),inset_0_1px_rgba(255,255,255,0.08),inset_0_0_35px_rgba(94,234,240,0.035)] backdrop-blur-[20px] p-8 sm:p-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img src={ANARC} alt="ANARC Logo" className="w-16 h-16 object-contain" />
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-[10px] mb-3 text-[#8fd8dd] font-mono text-[0.75rem] font-bold tracking-[0.16em]">
              <div className="w-[26px] h-px bg-[#d99a5b] shadow-[0_0_8px_rgba(217,154,91,0.8)]" />
              <span>ANARC</span>
              <div className="w-[26px] h-px bg-[#d99a5b] shadow-[0_0_8px_rgba(217,154,91,0.8)]" />
            </div>
            <h1 className="text-2xl font-semibold text-[#e9eef2] tracking-tight">
              Complete Your Profile
            </h1>
            <p className="text-[#96a3ad] text-sm mt-1">
              Welcome, {inviteInfo.name}! Set up your account to join ANARC.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Photo upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-24 h-24 rounded-full border-2 border-[rgba(94,234,240,0.32)] overflow-hidden bg-[rgba(7,12,18,0.5)] flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#55636d]" />
                )}
              </div>
              <label className="cursor-pointer text-xs text-[#4dd9e8] hover:text-[#7ee4ef] transition-colors">
                {uploading ? "Uploading..." : photoUrl ? "Change Photo" : "Upload Photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} />
              </label>
              {uploading && (
                <p className="text-xs text-[#8fd8dd] animate-pulse">Uploading to Cloudinary...</p>
              )}
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55636d]" />
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] pl-11 pr-4 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]"
                />
              </div>
            </div>

            {/* Batch */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                Batch
              </label>
              <input
                name="batch"
                type="text"
                value={form.batch}
                onChange={handleChange}
                placeholder="e.g. 2024"
                className="w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] px-4 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]"
              />
            </div>

            {/* Instagram */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                Instagram
              </label>
              <div className="relative">
                <LinkIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55636d]" />
                <input
                  name="instagram"
                  type="text"
                  value={form.instagram}
                  onChange={handleChange}
                  placeholder="@username"
                  className="w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] pl-11 pr-4 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                LinkedIn
              </label>
              <div className="relative">
                <LinkIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55636d]" />
                <input
                  name="linkedin"
                  type="text"
                  value={form.linkedin}
                  onChange={handleChange}
                  placeholder="linkedin.com/in/username"
                  className="w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] pl-11 pr-4 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]"
                />
              </div>
            </div>

            {/* GitHub */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                GitHub
              </label>
              <div className="relative">
                <LinkIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55636d]" />
                <input
                  name="github"
                  type="text"
                  value={form.github}
                  onChange={handleChange}
                  placeholder="github.com/username"
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
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] pl-11 pr-11 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55636d] hover:text-[#4dd9e8] transition-colors"
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[#8fd8dd]">
                Confirm Password
              </label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55636d]" />
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className="w-full rounded-xl border border-[rgba(138,164,178,0.2)] bg-[rgba(7,12,18,0.5)] pl-11 pr-11 py-3.5 text-sm text-[#e9eef2] caret-[#4dd9e8] placeholder-[#55636d] outline-none transition-all duration-300 focus:border-[rgba(94,234,240,0.5)] focus:shadow-[0_0_0_2px_rgba(77,217,232,0.08),0_0_12px_rgba(77,217,232,0.15)]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#55636d] hover:text-[#4dd9e8] transition-colors"
                >
                  {showConfirm ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full rounded-xl border border-[rgba(94,234,240,0.32)] bg-[rgba(94,234,240,0.05)] py-3.5 text-sm font-semibold text-[#4dd9e8] tracking-wide transition-all duration-300 hover:bg-[rgba(94,234,240,0.10)] hover:border-[rgba(94,234,240,0.75)] hover:shadow-[0_0_20px_rgba(77,217,232,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading photo..." : loading ? "Setting up your account..." : "Join ANARC"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}