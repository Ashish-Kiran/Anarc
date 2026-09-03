import { useEffect, useState } from "react";

const bootLines = [
  "> INITIALIZING ANARC SYSTEM...",
  "> LOADING CORE MODULES...",
  "> ESTABLISHING NEURAL LINK...",
  "> CALIBRATING SENSOR ARRAY...",
  "> SYSTEM READY.",
];

export default function SplashScreen({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        setLines((prev) => [...prev, bootLines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setDone(true), 400);
        setTimeout(() => setFadeOut(true), 700);
        setTimeout(() => onComplete(), 1100);
      }
    }, 350);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#080706] transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <div
        className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at 100% 0%, rgba(94,234,240,0.5) 0%, rgba(94,234,240,0.15) 25%, transparent 50%)",
          transform: "rotate(-10deg) translate(10%, -10%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] pointer-events-none opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at 0% 100%, rgba(255,180,84,0.45) 0%, rgba(255,180,84,0.12) 25%, transparent 60%)",
          transform: "rotate(-10deg) translate(-10%, 10%)",
        }}
      />
      {/* Logo */}
      <div
        className={`mb-10 transition-all duration-500 ${done ? "scale-110 opacity-100" : "opacity-80"}`}
      >
        <p className="text-[#ffb454] font-['DM_Mono',monospace] text-xs tracking-[0.4em] mb-3 text-center">
          NIT AGARTALA
        </p>
        <h1 className="text-white font-['DM_Mono',monospace] text-5xl font-bold tracking-[0.3em] text-center">
          ANARC
        </h1>
        <p className="text-white/30 font-['DM_Mono',monospace] text-[10px] tracking-[0.2em] mt-2 text-center">
          ROBOTICS CLUB
        </p>
      </div>

      {/* Divider */}
      <div className="w-64 h-px bg-gradient-to-r from-transparent via-[#5eeaf0]/40 to-transparent mb-8" />

      {/* Boot lines */}
      <div className="w-72 flex flex-col gap-2">
        {lines.map((line, i) => (
          <p
            key={i}
            className={`font-['DM_Mono',monospace] text-[11px] tracking-[0.05em] ${
              i === lines.length - 1 && done
                ? "text-[#5eeaf0]"
                : "text-white/40"
            }`}
          >
            {line}
            {i === lines.length - 1 && !done && (
              <span className="animate-pulse">▌</span>
            )}
          </p>
        ))}
      </div>

      {/* Bottom bar */}
      {done && (
        <div className="absolute bottom-8 w-64 h-px bg-gradient-to-r from-transparent via-[#5eeaf0] to-transparent animate-pulse" />
      )}
    </div>
  );
}
