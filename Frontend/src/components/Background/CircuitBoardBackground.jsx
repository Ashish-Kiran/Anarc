import React, { useEffect, useRef } from 'react';

/**
 * CircuitBoardBackground
 * -----------------------
 * A full-bleed, animated PCB-style background. Traces idle with slow
 * amber "standby current" pulses; moving the cursor acts like a
 * continuity probe — nearby traces and chip nodes light up cyan/blue
 * and fire sparks along their connected paths.
 *
 * Usage:
 *   <CircuitBoardBackground>
 *     <YourNavbar />
 *     <YourHero />
 *   </CircuitBoardBackground>
 *
 * Drop your real content in as children — it renders in normal flow
 * above the canvas, so the background grows with your page height.
 * No props are required; it renders demo content on its own so you
 * can preview it standalone.
 */

const COLORS = {
  dormant: (a) => `rgba(138,164,178,${a})`,
  copper: '#d99a5b',
  copperGlow: 'rgba(217,154,91,0.85)',
  cyan: '#5eeaf0',
  blue: '#4a9eff',
};

const PROBE_RADIUS = 150;
const SPARK_RADIUS = 46;
const MAX_AMBIENT_PULSES = 16;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function smoothBoost(dist, radius) {
  const t = clamp(1 - dist / radius, 0, 1);
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = clamp(t, 0, 1);
  const cx = x1 + dx * t;
  const cy = y1 + dy * t;
  return Math.hypot(px - cx, py - cy);
}

function buildWorld(width, height) {
  const spacing = width < 640 ? 68 : width < 1024 ? 88 : 108;
  const cols = Math.ceil(width / spacing) + 2;
  const rows = Math.ceil(height / spacing) + 2;

  const grid = {};
  const nodes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const jx = (Math.random() - 0.5) * spacing * 0.3;
      const jy = (Math.random() - 0.5) * spacing * 0.3;
      const node = {
        id: `${r}-${c}`,
        x: c * spacing + jx,
        y: r * spacing + jy,
        isChip: Math.random() < 0.05,
        seed: Math.random() * Math.PI * 2,
        lastSpark: -Infinity,
      };
      grid[node.id] = node;
      nodes.push(node);
    }
  }

  const edges = [];
  const adjacency = new Map();
  const link = (a, b) => {
    const edge = { id: `${a.id}_${b.id}`, a, b };
    edges.push(edge);
    if (!adjacency.has(a.id)) adjacency.set(a.id, []);
    if (!adjacency.has(b.id)) adjacency.set(b.id, []);
    adjacency.get(a.id).push(edge);
    adjacency.get(b.id).push(edge);
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = grid[`${r}-${c}`];
      if (!a) continue;
      if (c < cols - 1 && Math.random() < 0.55) link(a, grid[`${r}-${c + 1}`]);
      if (r < rows - 1 && Math.random() < 0.55) link(a, grid[`${r + 1}-${c}`]);
    }
  }

  return { nodes, edges, adjacency };
}

export default function CircuitBoardBackground({ children, className = '', style = {} }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const worldRef = useRef({ nodes: [], edges: [], adjacency: new Map() });
  const pulsesRef = useRef([]);
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
      worldRef.current = buildWorld(width, height);
      pulsesRef.current = [];
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
    let lastAmbientSpawn = 0;

    function spawnPulse(edge, speed, color) {
      pulsesRef.current.push({ edge, t: 0, speed, color });
    }

    function frame(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const { nodes, edges, adjacency } = worldRef.current;
      const width = wrapper.clientWidth;
      const height = wrapper.clientHeight;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, width, height);

      // Ambient standby pulses (skipped under reduced-motion)
      if (!reducedMotion && now - lastAmbientSpawn > 550 && pulsesRef.current.length < MAX_AMBIENT_PULSES && edges.length) {
        const edge = edges[(Math.random() * edges.length) | 0];
        spawnPulse(edge, 0.5 + Math.random() * 0.35, 'amber');
        lastAmbientSpawn = now;
      }

      // Traces
      for (const edge of edges) {
        const { a, b } = edge;
        const dist = mouse.active ? distToSegment(mouse.x, mouse.y, a.x, a.y, b.x, b.y) : Infinity;
        const boost = mouse.active ? smoothBoost(dist, PROBE_RADIUS) : 0;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        if (boost > 0.02) {
          const r = Math.round(lerp(120, 74, boost));
          const g = Math.round(lerp(150, 214, boost));
          const bch = Math.round(lerp(165, 255, boost));
          ctx.strokeStyle = `rgba(${r},${g},${bch},${0.18 + 0.55 * boost})`;
          ctx.lineWidth = 1 + boost * 1.3;
          ctx.shadowColor = `rgba(94,234,240,${0.55 * boost})`;
          ctx.shadowBlur = 12 * boost;
        } else {
          ctx.strokeStyle = COLORS.dormant(0.14);
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Traveling pulses (current flow)
      pulsesRef.current = pulsesRef.current.filter((p) => {
        p.t += p.speed * dt;
        if (p.t >= 1) return false;
        const { a, b } = p.edge;
        const t0 = Math.max(0, p.t - 0.09);
        const x0 = lerp(a.x, b.x, t0);
        const y0 = lerp(a.y, b.y, t0);
        const x1 = lerp(a.x, b.x, p.t);
        const y1 = lerp(a.y, b.y, p.t);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = p.color === 'cyan' ? 'rgba(94,234,240,0.95)' : COLORS.copperGlow;
        ctx.lineWidth = 2;
        ctx.shadowColor = p.color === 'cyan' ? COLORS.cyan : COLORS.copper;
        ctx.shadowBlur = 9;
        ctx.stroke();
        ctx.shadowBlur = 0;
        return true;
      });

      // Nodes / chips
      for (const node of nodes) {
        const dist = mouse.active ? Math.hypot(mouse.x - node.x, mouse.y - node.y) : Infinity;
        const boost = mouse.active ? smoothBoost(dist, PROBE_RADIUS) : 0;

        if (node.isChip) {
          const flicker = reducedMotion ? 0.22 : 0.22 + 0.12 * Math.sin(now / 900 + node.seed);
          const glow = clamp(flicker + boost, 0, 1);

          if (!reducedMotion && dist < SPARK_RADIUS && now - node.lastSpark > 700) {
            node.lastSpark = now;
            const nodeEdges = adjacency.get(node.id) || [];
            nodeEdges.slice(0, 2).forEach((edge) => spawnPulse(edge, 1.1, 'cyan'));
          }

          const size = 6;
          ctx.save();
          ctx.translate(node.x, node.y);
          const color = boost > 0.15 ? COLORS.cyan : COLORS.copper;
          ctx.fillStyle = `rgba(${boost > 0.15 ? '94,234,240' : '217,154,91'},${0.15 + glow * 0.6})`;
          ctx.shadowColor = color;
          ctx.shadowBlur = 6 + glow * 10;
          ctx.beginPath();
          ctx.roundRect(-size / 2, -size / 2, size, size, 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(${boost > 0.15 ? '94,234,240' : '217,154,91'},${0.25 + glow * 0.4})`;
          ctx.lineWidth = 1;
          const pin = size / 2 + 2.5;
          [[0, -pin], [0, pin], [-pin, 0], [pin, 0]].forEach(([px, py]) => {
            ctx.beginPath();
            ctx.moveTo(px * 0.5, py * 0.5);
            ctx.lineTo(px, py);
            ctx.stroke();
          });
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = COLORS.dormant(0.18 + boost * 0.4);
          ctx.fill();
        }
      }

      // Probe glow at cursor
      if (mouse.active) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, PROBE_RADIUS);
        grad.addColorStop(0, 'rgba(94,234,240,0.10)');
        grad.addColorStop(0.4, 'rgba(74,158,255,0.05)');
        grad.addColorStop(1, 'rgba(74,158,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, PROBE_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.cyan;
        ctx.shadowColor = COLORS.cyan;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
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
      className={`cbg-wrap ${className}`}
      style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden', background: 'linear-gradient(160deg, #070a0e 0%, #0c131b 55%, #090d12 100%)', ...style }}
    >
      <style>{`
        .cbg-wrap * { box-sizing: border-box; }
        .cbg-canvas { position: absolute; inset: 0; display: block; pointer-events: none; }
        .cbg-vignette {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 45%, rgba(4,6,8,0.65) 100%);
        }
        .cbg-content { position: relative; z-index: 10; }
        .cbg-demo { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: clamp(24px, 6vw, 96px); font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
        .cbg-eyebrow {
          display: inline-flex; align-items: center; gap: 8px; width: fit-content;
          font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", monospace;
          font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
          color: #8fd8dd; margin-bottom: 20px;
        }
        .cbg-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #5eeaf0;
          box-shadow: 0 0 8px #5eeaf0; animation: cbg-blink 1.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) { .cbg-dot { animation: none; } }
        @keyframes cbg-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        .cbg-title {
          font-size: clamp(32px, 5.5vw, 64px); line-height: 1.05; font-weight: 600;
          color: #e9eef2; max-width: 16ch; margin: 0 0 18px 0; letter-spacing: -0.01em;
        }
        .cbg-sub {
          font-size: clamp(15px, 1.6vw, 18px); line-height: 1.6; color: #96a3ad;
          max-width: 46ch; margin: 0 0 32px 0;
        }
        .cbg-cta {
          width: fit-content; padding: 12px 22px; font-size: 14px; font-weight: 600;
          color: #e9eef2; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(94,234,240,0.32); border-radius: 6px;
          cursor: pointer; transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .cbg-cta:hover { border-color: rgba(94,234,240,0.75); background: rgba(94,234,240,0.06); transform: translateY(-1px); }
        .cbg-cta:focus-visible { outline: 2px solid #5eeaf0; outline-offset: 3px; }
        .cbg-meta {
          margin-top: 28px; font-family: ui-monospace, "JetBrains Mono", monospace;
          font-size: 12px; color: #55636d;
        }
      `}</style>

      <canvas ref={canvasRef} className="cbg-canvas" />
      <div className="cbg-vignette" />

      <div className="cbg-content">
        {children ?? (
          <div className="cbg-demo">
            <span className="cbg-eyebrow"><span className="cbg-dot" />ASIMOV · NIT AGARTALA ROBOTICS CLUB</span>
            <h1 className="cbg-title">We build the machines that learn to move.</h1>
            <p className="cbg-sub">
              Autonomous rovers, embedded systems, and open builds from a lab that runs on
              solder smoke and late-night debugging. Move your cursor across the board.
            </p>
            <button className="cbg-cta">See our builds</button>
            <span className="cbg-meta">currently probing: sand-rover-v2 · line-follower calibration</span>
          </div>
        )}
      </div>
    </div>
  );
}
