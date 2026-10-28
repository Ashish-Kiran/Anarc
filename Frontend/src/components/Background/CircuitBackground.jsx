import React, { useEffect, useRef } from 'react';

// Single signature accent — like one status LED on a real board.
// Everything else (copper traces, silkscreen, solder points) stays quiet.
const ACCENT = '#ffb454';

const PALETTE = {
  grid: 'rgba(210,195,170,0.035)',
  trace: 'rgba(180,120,72,0.34)',
  node: 'rgba(216,210,198,0.45)',
  chipFill: 'rgba(255,250,240,0.02)',
  chipStroke: 'rgba(230,225,210,0.16)',
  pin: 'rgba(230,225,210,0.22)',
};

function roundRectPath(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.arcTo(x + w, y, x + w, y + r, r);
  c.lineTo(x + w, y + h - r);
  c.arcTo(x + w, y + h, x + w - r, y + h, r);
  c.lineTo(x + r, y + h);
  c.arcTo(x, y + h, x, y + h - r, r);
  c.lineTo(x, y + r);
  c.arcTo(x, y, x + r, y, r);
  c.closePath();
}

export function CircuitBackground({ children, className = '', style = {} }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ staticCanvas: null, traces: [], blinkNodes: [], width: 0, height: 0, dpr: 1 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const GRID = 26;
    const snap = (v) => Math.round(v / GRID) * GRID;

    function buildLayout(w, h) {
      const area = w * h;
      const traceCount = Math.max(12, Math.min(36, Math.floor(area / 16000)));
      const traces = [];

      for (let i = 0; i < traceCount; i++) {
        let x = snap(Math.random() * w);
        let y = snap(Math.random() * h);
        const points = [{ x, y }];
        const segments = 2 + Math.floor(Math.random() * 3);
        let horizontal = Math.random() < 0.5;
        for (let s = 0; s < segments; s++) {
          const len = (1 + Math.floor(Math.random() * 5)) * GRID;
          if (horizontal) x += Math.random() < 0.5 ? len : -len;
          else y += Math.random() < 0.5 ? len : -len;
          x = Math.max(0, Math.min(w, x));
          y = Math.max(0, Math.min(h, y));
          points.push({ x, y });
          horizontal = !horizontal;
        }
        let total = 0;
        const cum = [0];
        for (let p = 1; p < points.length; p++) {
          total += Math.hypot(points[p].x - points[p - 1].x, points[p].y - points[p - 1].y);
          cum.push(total);
        }
        traces.push({
          points, cum, total,
          speed: 40 + Math.random() * 50,
          offset: Math.random() * (total || 1),
          active: Math.random() < 0.55,
          history: [],
        });
      }

      const chips = [];
      const chipCount = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < chipCount; i++) {
        const cw = (3 + Math.floor(Math.random() * 3)) * GRID;
        const ch = (2 + Math.floor(Math.random() * 2)) * GRID;
        const cx = snap(Math.random() * Math.max(1, w - cw));
        const cy = snap(Math.random() * Math.max(1, h - ch));
        chips.push({ x: cx, y: cy, w: cw, h: ch });
      }

      const blinkNodes = traces
        .filter(() => Math.random() < 0.6)
        .map((t) => {
          const p = t.points[t.points.length - 1];
          return { x: p.x, y: p.y, phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 1.2 };
        });

      return { traces, chips, blinkNodes };
    }

    function drawStatic(c, w, h, layout) {
      c.clearRect(0, 0, w, h);

      const grad = c.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, Math.max(w, h) * 0.8);
      grad.addColorStop(0, '#171310');
      grad.addColorStop(1, '#080706');
      c.fillStyle = grad;
      c.fillRect(0, 0, w, h);

      c.fillStyle = PALETTE.grid;
      for (let gx = GRID; gx < w; gx += GRID) {
        for (let gy = GRID; gy < h; gy += GRID) {
          c.fillRect(gx, gy, 1, 1);
        }
      }

      layout.chips.forEach((chip) => {
        roundRectPath(c, chip.x, chip.y, chip.w, chip.h, 4);
        c.fillStyle = PALETTE.chipFill;
        c.fill();
        c.strokeStyle = PALETTE.chipStroke;
        c.lineWidth = 1;
        c.stroke();

        c.strokeStyle = PALETTE.pin;
        for (let px = chip.x + GRID; px < chip.x + chip.w; px += GRID) {
          c.beginPath(); c.moveTo(px, chip.y); c.lineTo(px, chip.y - 6); c.stroke();
          c.beginPath(); c.moveTo(px, chip.y + chip.h); c.lineTo(px, chip.y + chip.h + 6); c.stroke();
        }
        c.fillStyle = PALETTE.pin;
        c.beginPath();
        c.arc(chip.x + 8, chip.y + 8, 2, 0, Math.PI * 2);
        c.fill();
      });

      layout.traces.forEach((t) => {
        c.strokeStyle = PALETTE.trace;
        c.lineWidth = 1.4;
        c.lineJoin = 'round';
        c.beginPath();
        t.points.forEach((p, idx) => (idx === 0 ? c.moveTo(p.x, p.y) : c.lineTo(p.x, p.y)));
        c.stroke();
        c.fillStyle = PALETTE.node;
        t.points.forEach((p) => {
          c.beginPath();
          c.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
          c.fill();
        });
      });
    }

    function pointAtDistance(trace, dist) {
      const { points, cum, total } = trace;
      if (total === 0) return points[0];
      const d = ((dist % total) + total) % total;
      for (let i = 1; i < cum.length; i++) {
        if (d <= cum[i]) {
          const segLen = cum[i] - cum[i - 1];
          const tt = segLen === 0 ? 0 : (d - cum[i - 1]) / segLen;
          const p0 = points[i - 1], p1 = points[i];
          return { x: p0.x + (p1.x - p0.x) * tt, y: p0.y + (p1.y - p0.y) * tt };
        }
      }
      return points[points.length - 1];
    }

    let resizeTimeout;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';

      const staticCanvas = document.createElement('canvas');
      staticCanvas.width = Math.round(w * dpr);
      staticCanvas.height = Math.round(h * dpr);
      const sctx = staticCanvas.getContext('2d');
      sctx.scale(dpr, dpr);

      const layout = buildLayout(w, h);
      drawStatic(sctx, w, h, layout);

      stateRef.current = {
        staticCanvas, width: w, height: h, dpr,
        traces: layout.traces, blinkNodes: layout.blinkNodes,
      };
    }

    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 200);
    }

    resize();
    window.addEventListener('resize', onResize);

    const start = performance.now();

    function drawFrame(t) {
      const st = stateRef.current;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (st.staticCanvas) ctx.drawImage(st.staticCanvas, 0, 0);
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);

      st.blinkNodes.forEach((n) => {
        const alpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * n.speed + n.phase));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = ACCENT;
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      st.traces.forEach((tr) => {
        if (!tr.active || tr.total === 0) return;
        const dist = tr.offset + t * tr.speed;
        const pos = pointAtDistance(tr, dist);
        tr.history.push(pos);
        if (tr.history.length > 7) tr.history.shift();

        tr.history.forEach((p, idx) => {
          const a = (idx + 1) / tr.history.length;
          ctx.globalAlpha = a * 0.5;
          ctx.fillStyle = ACCENT;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.8 * a + 0.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalAlpha = 1;
        ctx.fillStyle = ACCENT;
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    function loop(now) {
      drawFrame((now - start) / 1000);
      rafRef.current = requestAnimationFrame(loop);
    }

    if (reducedMotion) {
      drawFrame(0);
    } else {
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    // Background color is left as inline style (merged with the caller's
    // `style` prop) rather than a Tailwind class, because it's designed to
    // be overridable at runtime via the `style` prop — baking it into a
    // static className would silently remove that override capability.
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: '#080706', ...style }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
}

export default function Demo() {
  return (
    <CircuitBackground className="min-h-screen">
      <div className="flex flex-col items-center justify-center h-full min-h-screen text-center px-6">
        {/*
          `color` stays as an inline style bound to the ACCENT constant.
          Tailwind's compiler statically scans source text for complete
          class names — an interpolated arbitrary value like
          `text-[${ACCENT}]` won't be detected at build time, so the class
          would silently produce no CSS. Keeping it as a JS-driven inline
          style preserves the "single accent constant" behavior exactly.
        */}
        <div
          className="[font-family:'IBM_Plex_Mono','JetBrains_Mono',ui-monospace,'SF_Mono',Menlo,monospace] tracking-[0.3em] text-[11px] mb-[18px]"
          style={{ color: ACCENT }}
        >
          SIGNAL ACTIVE
        </div>
        <h1 className="text-white font-bold text-[44px] tracking-[-0.01em] [font-family:'Space_Grotesk',Inter,ui-sans-serif,system-ui,sans-serif]">
          Circuit Background
        </h1>
        <p className="text-[rgba(220,210,195,0.55)] max-w-[460px] mt-4 text-[13.5px] leading-[1.7] [font-family:'IBM_Plex_Mono','JetBrains_Mono',ui-monospace,'SF_Mono',Menlo,monospace]">
          Copper traces routed across a dark board, one amber signal drifting
          through the live paths, solder points catching the glow.
        </p>
      </div>
    </CircuitBackground>
  );
}