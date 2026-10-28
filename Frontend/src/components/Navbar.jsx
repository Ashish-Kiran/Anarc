import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ANARC from "./../assets/AnarcLogo.png";
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiBox,
  FiMail,
  FiSettings,
  FiUser,
  FiFileText,
  FiAward,
} from "react-icons/fi";

const defaultNavItems = [
  { label: "HOME", icon: FiHome, path: "/" },
  { label: "EVENT", icon: FiCalendar, path: "/events" },
  { label: "TEAM", icon: FiUsers, path: "/members" },
  { label: "PROJECT", icon: FiBox, path: "/projects" },
  { label: "LEGACY", icon: FiAward, path: "/legacy" },
  { label: "CONTACT", icon: FiMail, path: "/contact" },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function Avatar({ user, size = "sm", onClick }) {
  const sizeClass = size === "lg" ? "w-16 h-16 text-xl" : "w-10 h-10 text-sm";
  return user.photo ? (
    <img
      src={user.photo}
      alt={user.name}
      onClick={onClick}
      className={`${sizeClass} rounded-[7px] object-cover border border-[#5eeaf0]/60 cursor-pointer`}
    />
  ) : (
    <div
      onClick={onClick}
      className={`${sizeClass} rounded-[7px] border border-[#5eeaf0]/50 flex items-center justify-center font-bold text-[#5eeaf0] bg-[#5eeaf0]/10 font-['DM_Mono',monospace] cursor-pointer hover:bg-[#5eeaf0]/20 hover:border-[#5eeaf0] transition-all duration-200`}
    >
      {getInitials(user.name)}
    </div>
  );
}

function RoleBadge({ SiteRole }) {
  const colors = {
    ADMIN: "bg-red-500/20 text-red-400 border-red-500/30",
    MEMBER: "bg-[#5eeaf0]/10 text-[#5eeaf0] border-[#5eeaf0]/30",
    APPLICANT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };
  return (
    <span
      className={`text-[10px] font-bold tracking-[0.15em] px-2 py-0.5 rounded border font-['DM_Mono',monospace] ${colors[SiteRole] || colors.MEMBER}`}
    >
      {SiteRole}
    </span>
  );
}

export default function Navbar({ navItems = defaultNavItems, onMenuClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const storedApplicant = localStorage.getItem("applicant_user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const applicant = storedApplicant ? JSON.parse(storedApplicant) : null;

  const isLoggedIn = !!(user || applicant);
  const currentPerson = user || applicant;
  const isApplicant = !!applicant && !user;
  const isAdmin = user?.siteRole === "ADMIN";
  const isMember = user?.siteRole === "MEMBER";

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/notifications/unread-count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.count || 0))
      .catch(() => setUnreadCount(0));
  }, [user]);

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 8);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("applicant_token");
    localStorage.removeItem("applicant_user");
    setIsMenuOpen(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <>
      <style>{`
        .glass-nav-item {
          position: relative;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        .glass-nav-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(94,234,240,0.08) 0%, rgba(94,234,240,0.02) 100%);
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
          border-radius: inherit;
        }
        .glass-nav-item:hover::before { opacity: 1; }
        .glass-nav-item.active-item::before { opacity: 1; }
      `}</style>

      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 z-[100] w-full text-white box-border transition-all duration-[180ms] ease-in-out ${
          isScrolled
            ? "bg-[rgba(7,10,14,0.92)] border-b border-[rgba(94,234,240,0.18)] backdrop-blur-[6px]"
            : "bg-transparent"
        }`}
      >
        <div className="flex justify-between items-center w-[90%] min-h-[72px] mx-auto px-[28px] box-border">
          <Link to="/" aria-label="ANARC home">
            <img
              src={ANARC}
              alt="ANARC"
              className="w-10 h-10 object-contain block"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden [@media(min-width:901px)]:flex items-center gap-[clamp(16px,2.5vw,36px)] mx-auto">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`font-['DM_Mono',sans-serif] text-[0.95rem] tracking-[0.12em] no-underline transition-colors duration-150 hover:text-[#5eeaf0] ${
                  location.pathname === item.path
                    ? "text-[#5eeaf0]"
                    : "text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <div className="hidden [@media(min-width:901px)]:block">
                <Avatar
                  user={currentPerson}
                  onClick={() => setIsMenuOpen((p) => !p)}
                />
              </div>
            )}
            <button
              className={`grid gap-[5px] w-10 h-10 py-[10px] px-[8px] border border-white/25 rounded-[7px] bg-white/[0.04] cursor-pointer hover:border-[#5eeaf0]/60 transition-colors relative z-[110] ${
                isLoggedIn ? "[@media(min-width:901px)]:hidden" : ""
              }`}
              type="button"
              onClick={() => {
                setIsMenuOpen((p) => !p);
                onMenuClick?.();
              }}
            >
              <span
                className={`block w-full h-px bg-white transition-transform duration-200 ${isMenuOpen ? "rotate-45 translate-y-[6px]" : ""}`}
              />
              <span
                className={`block w-full h-px bg-white transition-opacity duration-200 ${isMenuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-full h-px bg-white transition-transform duration-200 ${isMenuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop — rendered outside header so it covers full page */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[104] bg-black/75"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar — rendered outside header, fully independent */}
      <div
        className={`fixed top-0 right-0 h-screen w-[65%] max-w-[300px] z-[105] flex flex-col items-stretch px-5 pt-8 pb-8 transition-transform duration-300 overflow-y-auto ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: "#070a0e",
          borderLeft: "1px solid rgba(94,234,240,0.15)",
        }}
      >
        {/* User Profile */}
        {isLoggedIn && (
          <>
            <div className="flex flex-col items-center gap-2 mb-6">
              <Avatar user={currentPerson} size="lg" />
              <p className="text-white font-medium text-sm mt-1">
                {currentPerson.name}
              </p>
              <RoleBadge SiteRole={isApplicant ? "APPLICANT" : user.siteRole} />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#5eeaf0]/20 to-transparent mb-4" />
          </>
        )}

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`glass-nav-item flex items-center gap-4 px-4 py-3.5 rounded-lg no-underline border ${
                  isActive
                    ? "active-item text-[#5eeaf0] border-[#5eeaf0]/30 bg-[#5eeaf0]/[0.06]"
                    : "text-white/80 border-transparent hover:text-[#5eeaf0] hover:border-[#5eeaf0]/20"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-[#5eeaf0] rounded-r-full" />
                )}
                <Icon size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Applicant */}
        {isApplicant && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-[#5eeaf0]/20 to-transparent my-4" />
            <Link
              to="/application/status"
              onClick={() => setIsMenuOpen(false)}
              className="glass-nav-item flex items-center gap-4 px-4 py-3.5 rounded-lg no-underline border border-transparent text-amber-400/80 hover:text-amber-400 hover:border-amber-400/20 hover:bg-amber-400/[0.04] transition-all"
            >
              <FiFileText size={18} className="flex-shrink-0" />
              <span className="text-sm font-medium tracking-wide">
                My Application
              </span>
              {applicant?.status && applicant.status !== "PENDING" && (
                <span className="ml-auto w-2 h-2 rounded-full bg-amber-400" />
              )}
            </Link>
          </>
        )}

        {/* Member */}
        {isMember && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-[#5eeaf0]/20 to-transparent my-4" />
            <Link
              to="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="glass-nav-item flex items-center gap-4 px-4 py-3.5 rounded-lg no-underline border border-transparent text-white/80 hover:text-[#5eeaf0] hover:border-[#5eeaf0]/20 transition-all"
            >
              <FiUser size={18} className="flex-shrink-0" />
              <span className="text-sm font-medium tracking-wide">
                My Dashboard
              </span>
            </Link>
          </>
        )}

        {/* Admin */}
        {isAdmin && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-[#5eeaf0]/20 to-transparent my-4" />
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="glass-nav-item flex items-center gap-4 px-4 py-3.5 rounded-lg no-underline border border-transparent text-red-400/80 hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/[0.04] transition-all"
            >
              <FiSettings size={18} className="flex-shrink-0" />
              <span className="text-sm font-medium tracking-wide">
                Admin Dashboard
              </span>
            </Link>
          </>
        )}

        {/* Profile */}
        {(isMember || isAdmin) && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-[#5eeaf0]/20 to-transparent my-4" />
            <Link
              to="/profile"
              // onClick={() => setIsMenuOpen(false)}
              className="glass-nav-item flex items-center gap-4 px-4 py-3.5 rounded-lg no-underline border border-transparent text-white/80 hover:text-[#5eeaf0] hover:border-[#5eeaf0]/20 transition-all"
            >
              <FiUser size={18} className="flex-shrink-0" />
              <span className="text-sm font-medium tracking-wide">Profile</span>
            </Link>
          </>
        )}

        {/* Login / Logout */}
        <div className="mt-auto flex flex-col gap-3">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="glass-nav-item w-full py-3 font-['DM_Mono',monospace] text-sm tracking-[0.1em] font-semibold text-red-400 border-2 border-red-400/40 rounded-lg bg-transparent hover:bg-red-400/[0.06] hover:border-red-400/70 transition-all duration-200"
            >
              LOGOUT
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="glass-nav-item w-full py-3 font-['DM_Mono',monospace] text-sm tracking-[0.1em] font-semibold text-[#5eeaf0] border-2 border-[#5eeaf0]/40 rounded-lg bg-transparent hover:bg-[#5eeaf0]/[0.06] hover:border-[#5eeaf0]/70 transition-all duration-200 text-center no-underline"
            >
              LOGIN
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
