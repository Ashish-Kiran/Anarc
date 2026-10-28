import React, { useEffect, useRef } from 'react';

const COLORS = {
  dormant: (a) => `rgba(138,164,178,${a})`,
  copper: '#d99a5b',
  cyan: '#5eeaf0',
  blue: '#4a9eff',
};

const TRACK_RADIUS = 150;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function smoothBoost(dist, radius) {
  const t = clamp(1 - dist / radius, 0, 1);
  return t * t * (3 - 2 * t);
}

// Shortest-path angle interpolation (handles the -PI/PI wraparound)
function lerpAngle(a, b, t) {
  let diff = (b - a) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

function buildSwarm(width, height) {
  const cell = width < 640 ? 170 : width < 1024 ? 210 : 250;
  const cols = Math.ceil(width / cell) + 1;
  const rows = Math.ceil(height / cell) + 1;

  const turrets = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < 0.22) continue; // scatter, not a rigid grid
      const jx = (Math.random() - 0.5) * cell * 0.5;
      const jy = (Math.random() - 0.5) * cell * 0.5;
      const restAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
      turrets.push({
        baseX: c * cell + cell / 2 + jx,
        baseY: r * cell + cell / 2 + jy,
        len1: 14 + Math.random() * 8,
        len2: 12 + Math.random() * 7,
        angle1: restAngle,
        angle2: restAngle,
        restAngle,
        ease1: 0.05 + Math.random() * 0.04,
        ease2: 0.03 + Math.random() * 0.03,
        idlePhaseA: Math.random() * 1000,
        idlePhaseB: Math.random() * 1000,
        ledPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  // Faint static links between nearby bases, purely textural
  const links = [];
  for (let i = 0; i < turrets.length; i++) {
    for (let j = i + 1; j < turrets.length; j++) {
      const a = turrets[i];
      const b = turrets[j];
      const d = Math.hypot(a.baseX - b.baseX, a.baseY - b.baseY);
      if (d < cell * 1.25) links.push([a, b]);
    }
  }

  return { turrets, links };
}

export default function ServoSwarmBackground({ children, className = '', style = {} }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const worldRef = useRef({ turrets: [], links: [] });
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return undefined;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setup() {
      const { width, height } = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      worldRef.current = buildSwarm(width, height);
    }

    setup();
    const ro = new ResizeObserver(() => setup());
    ro.observe(wrapper);

    function handleMove(e) {
      const rect = wrapper.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    }
    function handleLeave() {
      mouseRef.current.active = false;
    }
    wrapper.addEventListener('pointermove', handleMove);
    wrapper.addEventListener('pointerleave', handleLeave);

    let lastTime = performance.now();

    function frame(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const { turrets, links } = worldRef.current;
      const width = wrapper.clientWidth;
      const height = wrapper.clientHeight;
      const mouse = mouseRef.current;
      const k = clamp(dt * 60, 0, 2);

      ctx.clearRect(0, 0, width, height);

      // Faint static mesh between nearby bases
      ctx.strokeStyle = COLORS.dormant(0.05);
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      for (const [a, b] of links) {
        ctx.beginPath();
        ctx.moveTo(a.baseX, a.baseY);
        ctx.lineTo(b.baseX, b.baseY);
        ctx.stroke();
      }

      for (const t of turrets) {
        let target;
        if (mouse.active) {
          target = Math.atan2(mouse.y - t.baseY, mouse.x - t.baseX);
        } else if (!reducedMotion) {
          target = t.restAngle + Math.sin(now / 2000 + t.idlePhaseA) * 0.16 + Math.cos(now / 2600 + t.idlePhaseB) * 0.1;
        } else {
          target = t.restAngle;
        }

        if (reducedMotion) {
          t.angle1 = target;
          t.angle2 = target;
        } else {
          t.angle1 = lerpAngle(t.angle1, target, t.ease1 * k);
          t.angle2 = lerpAngle(t.angle2, t.angle1, t.ease2 * k);
        }

        const elbowX = t.baseX + Math.cos(t.angle1) * t.len1;
        const elbowY = t.baseY + Math.sin(t.angle1) * t.len1;
        const tipX = elbowX + Math.cos(t.angle2) * t.len2;
        const tipY = elbowY + Math.sin(t.angle2) * t.len2;

        const dist = mouse.active ? Math.hypot(tipX - mouse.x, tipY - mouse.y) : Infinity;
        const boost = mouse.active ? smoothBoost(dist, TRACK_RADIUS) : 0;

        // base mount
        ctx.save();
        ctx.translate(t.baseX, t.baseY);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = `rgba(217,154,91,${0.3 + boost * 0.3})`;
        ctx.fillRect(-2.5, -2.5, 5, 5);
        ctx.restore();

        // idle standby LED
        if (!reducedMotion) {
          const led = 0.12 + 0.15 * Math.sin(now / 1400 + t.ledPhase);
          ctx.beginPath();
          ctx.arc(t.baseX, t.baseY, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(217,154,91,${clamp(led, 0, 0.4)})`;
          ctx.fill();
        }

        // segment 1
        ctx.beginPath();
        ctx.moveTo(t.baseX, t.baseY);
        ctx.lineTo(elbowX, elbowY);
        ctx.strokeStyle = `rgba(150,178,192,${0.3 + boost * 0.35})`;
        ctx.lineWidth = 1.3;
        if (boost > 0.15) {
          ctx.shadowColor = COLORS.cyan;
          ctx.shadowBlur = 6 * boost;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // elbow joint
        ctx.beginPath();
        ctx.arc(elbowX, elbowY, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = boost > 0.15 ? `rgba(94,234,240,${0.5 + boost * 0.4})` : 'rgba(150,178,192,0.4)';
        ctx.fill();

        // segment 2
        ctx.beginPath();
        ctx.moveTo(elbowX, elbowY);
        ctx.lineTo(tipX, tipY);
        ctx.strokeStyle = `rgba(150,178,192,${0.35 + boost * 0.4})`;
        ctx.lineWidth = 1.3;
        if (boost > 0.15) {
          ctx.shadowColor = COLORS.cyan;
          ctx.shadowBlur = 7 * boost;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // tip sensor "eye"
        ctx.beginPath();
        ctx.arc(tipX, tipY, 2.2 + boost * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(94,234,240,${0.35 + boost * 0.55})`;
        ctx.shadowColor = COLORS.cyan;
        ctx.shadowBlur = 4 + boost * 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Target reticle at cursor
      if (mouse.active) {
        const rot = reducedMotion ? 0 : now / 4000;
        ctx.save();
        ctx.translate(mouse.x, mouse.y);
        ctx.rotate(rot);
        ctx.strokeStyle = 'rgba(94,234,240,0.55)';
        ctx.lineWidth = 1.2;
        const s = 9;
        const g = 4;
        [0, 1, 2, 3].forEach((i) => {
          ctx.save();
          ctx.rotate((Math.PI / 2) * i);
          ctx.beginPath();
          ctx.moveTo(g, -s);
          ctx.lineTo(s, -s);
          ctx.lineTo(s, -g);
          ctx.stroke();
          ctx.restore();
        });
        ctx.beginPath();
        ctx.arc(0, 0, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.cyan;
        ctx.shadowColor = COLORS.cyan;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      wrapper.removeEventListener('pointermove', handleMove);
      wrapper.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`sw-wrap relative min-h-screen w-full overflow-hidden bg-[linear-gradient(160deg,_#070a0e_0%,_#0c131b_55%,_#090d12_100%)] ${className}`}
      style={style}
    >
      {/*
        Two rules Tailwind classes genuinely can't express, kept as scoped CSS:
        1. `.sw-wrap *` — a universal descendant selector that forces
           box-sizing: border-box on every child, INCLUDING whatever
           consumer-supplied `children` get rendered inside. A utility
           class can only style the element it's attached to, so this
           can't be reproduced by adding classes to elements we control.
        2. `@keyframes sw-blink` — Tailwind's `animate-[sw-blink_...]`
           arbitrary value only emits the `animation` property; the
           keyframes themselves still need a real @keyframes rule to
           point at, so it's defined once here.
      */}
      <style>{`
        .sw-wrap * { box-sizing: border-box; }
        @keyframes sw-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>

      <canvas ref={canvasRef} className="absolute inset-0 block pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(4,6,8,0.65)_100%)]" />

      <div className="relative z-10">
        {children ?? (
          <div className="min-h-screen flex flex-col justify-center p-[clamp(24px,6vw,96px)] [font-family:ui-sans-serif,system-ui,-apple-system,sans-serif]">
            <span className="inline-flex items-center gap-2 w-fit text-[12px] tracking-[0.14em] uppercase text-[#8fd8dd] mb-5 [font-family:ui-monospace,'JetBrains_Mono','SFMono-Regular',monospace]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5eeaf0] shadow-[0_0_8px_#5eeaf0] animate-[sw-blink_1.8s_ease-in-out_infinite] motion-reduce:animate-none" />
              ASIMOV · NIT AGARTALA ROBOTICS CLUB
            </span>
            <h1 className="text-[clamp(32px,5.5vw,64px)] leading-[1.05] font-semibold text-[#e9eef2] max-w-[16ch] m-0 mb-[18px] tracking-[-0.01em]">
              Every sensor in the room is watching you move.
            </h1>
            <p className="text-[clamp(15px,1.6vw,18px)] leading-[1.6] text-[#96a3ad] max-w-[46ch] m-0 mb-8">
              A field of tracking turrets built from the same lab that solders our rovers
              together. Move your cursor — the swarm follows.
            </p>
            <button
              className="w-fit px-[22px] py-3 text-[14px] font-semibold text-[#e9eef2] bg-[rgba(255,255,255,0.03)] border border-[rgba(94,234,240,0.32)] rounded-md cursor-pointer transition-[border-color,background-color,transform] duration-200 hover:border-[rgba(94,234,240,0.75)] hover:bg-[rgba(94,234,240,0.06)] hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5eeaf0] focus-visible:outline-offset-[3px]"
            >
              See our builds
            </button>
            <span className="mt-7 text-[12px] text-[#55636d] [font-family:ui-monospace,'JetBrains_Mono',monospace]">
              currently probing: sand-rover-v2 · line-follower calibration
            </span>
          </div>
        )}
      </div>
    </div>
  );
}