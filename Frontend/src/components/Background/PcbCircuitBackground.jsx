// import React, { useEffect, useRef } from 'react';

// const GRID = 24;
// const REACT_DIST = 150;
// const COLORS = {
//   dormant: (alpha) => `rgba(138,164,178,${alpha})`,
//   copper: '#d99a5b',
//   cyan: '#5eeaf0',
// };

// const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
// const snap = (value) => Math.round(value / GRID) * GRID;

// function smoothBoost(distance, radius) {
//   const t = clamp(1 - distance / radius, 0, 1);
//   return t * t * (3 - 2 * t);
// }

// function lerpAngle(from, to, amount) {
//   let difference = (to - from) % (Math.PI * 2);
//   if (difference > Math.PI) difference -= Math.PI * 2;
//   if (difference < -Math.PI) difference += Math.PI * 2;
//   return from + difference * amount;
// }

// function distanceToSegment(px, py, x1, y1, x2, y2) {
//   const dx = x2 - x1;
//   const dy = y2 - y1;
//   const lengthSquared = dx * dx + dy * dy;
//   const t = clamp(lengthSquared === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lengthSquared, 0, 1);
//   return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
// }

// function buildBoard(width, height) {
//   const traces = [];
//   const pads = [];
//   const traceCount = Math.floor((width * height) / 32000);

//   for (let index = 0; index < traceCount; index += 1) {
//     let x = snap(Math.random() * width);
//     let y = snap(Math.random() * height);
//     const points = [{ x, y }];
//     const segments = 2 + Math.floor(Math.random() * 3);

//     for (let segment = 0; segment < segments; segment += 1) {
//       const length = GRID * (2 + Math.floor(Math.random() * 6));
//       if (Math.random() < 0.5) {
//         x = clamp(snap(x + (Math.random() < 0.5 ? -length : length)), 0, width);
//       } else {
//         y = clamp(snap(y + (Math.random() < 0.5 ? -length : length)), 0, height);
//       }
//       points.push({ x, y });
//     }

//     traces.push({ points, flow: 0 });
//     pads.push(points[0], points[points.length - 1]);
//   }

//   const chips = Array.from({ length: Math.floor((width * height) / 150000) }, () => {
//     const w = GRID * 3;
//     const h = GRID * 2;
//     return { x: snap(Math.random() * (width - w)), y: snap(Math.random() * (height - h)), w, h, seed: Math.random() * Math.PI * 2 };
//   });

//   const vias = Array.from({ length: Math.floor((width * height) / 26000) }, () => ({
//     x: snap(Math.random() * width),
//     y: snap(Math.random() * height),
//   }));

//   const turrets = Array.from({ length: Math.floor((width * height) / 420000) }, () => {
//     const restAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
//     return {
//       baseX: Math.random() * width, baseY: Math.random() * height,
//       len1: 10 + Math.random() * 6, len2: 9 + Math.random() * 5,
//       angle1: restAngle, angle2: restAngle, restAngle,
//       ease1: 0.05 + Math.random() * 0.04, ease2: 0.03 + Math.random() * 0.03,
//       idlePhaseA: Math.random() * 1000, idlePhaseB: Math.random() * 1000,
//     };
//   });

//   return { traces, pads, chips, vias, turrets };
// }

// /** A full-container PCB canvas background. Place your application inside `children`. */
// export default function PcbCircuitBackground({ children, className = '', style }) {
//   const wrapperRef = useRef(null);
//   const canvasRef = useRef(null);
//   const worldRef = useRef({ traces: [], pads: [], chips: [], vias: [], turrets: [] });
//   const pulsesRef = useRef([]);
//   const mouseRef = useRef({ x: -9999, y: -9999, active: false });
//   const animationFrameRef = useRef(null);

//   useEffect(() => {
//     const wrapper = wrapperRef.current;
//     const canvas = canvasRef.current;
//     const context = canvas?.getContext('2d');
//     if (!wrapper || !canvas || !context) return undefined;

//     const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
//     let lastTime = performance.now();
//     let lastPulseAt = 0;

//     function setup() {
//       const { width, height } = wrapper.getBoundingClientRect();
//       const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
//       canvas.width = Math.max(1, Math.floor(width * pixelRatio));
//       canvas.height = Math.max(1, Math.floor(height * pixelRatio));
//       context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
//       context.lineCap = 'round';
//       context.lineJoin = 'round';
//       worldRef.current = buildBoard(width, height);
//       pulsesRef.current = [];
//     }

//     function draw(now) {
//       const delta = Math.min((now - lastTime) / 1000, 0.05);
//       lastTime = now;
//       const { traces, pads, chips, vias, turrets } = worldRef.current;
//       const { width, height } = wrapper.getBoundingClientRect();
//       const mouse = mouseRef.current;
//       context.clearRect(0, 0, width, height);

//       vias.forEach(({ x, y }) => {
//         context.beginPath(); context.arc(x, y, 1, 0, Math.PI * 2);
//         context.fillStyle = COLORS.dormant(0.12); context.fill();
//       });

//       chips.forEach((chip) => {
//         const distance = mouse.active ? Math.hypot(mouse.x - chip.x - chip.w / 2, mouse.y - chip.y - chip.h / 2) : Infinity;
//         const boost = mouse.active ? smoothBoost(distance, REACT_DIST) : 0;
//         const flicker = reducedMotion ? 0.12 : 0.12 + 0.08 * Math.sin(now / 900 + chip.seed);
//         const glow = clamp(flicker + boost, 0, 0.9);
//         context.strokeStyle = boost > 0.15 ? `rgba(94,234,240,${0.25 + glow * 0.5})` : `rgba(217,154,91,${0.2 + glow * 0.4})`;
//         context.lineWidth = 1;
//         if (boost > 0.15) { context.shadowColor = COLORS.cyan; context.shadowBlur = 8 * boost; }
//         context.strokeRect(chip.x, chip.y, chip.w, chip.h); context.shadowBlur = 0;
//         for (let pin = chip.x + 6; pin < chip.x + chip.w; pin += 8) {
//           context.beginPath(); context.moveTo(pin, chip.y); context.lineTo(pin, chip.y - 4);
//           context.moveTo(pin, chip.y + chip.h); context.lineTo(pin, chip.y + chip.h + 4);
//           context.strokeStyle = `rgba(217,154,91,${0.15 + glow * 0.25})`; context.stroke();
//         }
//       });

//       traces.forEach((trace) => {
//         let distance = Infinity;
//         if (mouse.active) for (let index = 0; index < trace.points.length - 1; index += 1) {
//           const a = trace.points[index]; const b = trace.points[index + 1];
//           distance = Math.min(distance, distanceToSegment(mouse.x, mouse.y, a.x, a.y, b.x, b.y));
//         }
//         const near = mouse.active && distance < REACT_DIST;
//         context.beginPath(); context.moveTo(trace.points[0].x, trace.points[0].y);
//         trace.points.slice(1).forEach(({ x, y }) => context.lineTo(x, y));
//         if (near) {
//           trace.flow += 0.6; context.setLineDash([6, 6]); context.lineDashOffset = -trace.flow;
//           context.strokeStyle = `rgba(94,234,240,${0.25 + (1 - distance / REACT_DIST) * 0.65})`;
//           context.lineWidth = 1.5; context.shadowColor = COLORS.cyan; context.shadowBlur = 6 * (1 - distance / REACT_DIST);
//         } else { context.setLineDash([]); context.strokeStyle = COLORS.dormant(0.14); context.lineWidth = 1; }
//         context.stroke(); context.setLineDash([]); context.shadowBlur = 0;
//       });

//       if (!reducedMotion && now - lastPulseAt > 260 && pulsesRef.current.length < 28 && traces.length) {
//         const trace = traces[Math.floor(Math.random() * traces.length)];
//         pulsesRef.current.push({ trace, segment: Math.floor(Math.random() * (trace.points.length - 1)), t: 0, speed: 0.45 + Math.random() * 0.35 });
//         lastPulseAt = now;
//       }
//       pulsesRef.current = pulsesRef.current.filter((pulse) => {
//         pulse.t += pulse.speed * delta;
//         if (pulse.t >= 1) return false;
//         const a = pulse.trace.points[pulse.segment]; const b = pulse.trace.points[pulse.segment + 1];
//         context.beginPath(); context.moveTo(a.x + (b.x - a.x) * Math.max(0, pulse.t - 0.12), a.y + (b.y - a.y) * Math.max(0, pulse.t - 0.12));
//         context.lineTo(a.x + (b.x - a.x) * pulse.t, a.y + (b.y - a.y) * pulse.t);
//         context.strokeStyle = 'rgba(217,154,91,0.9)'; context.lineWidth = 2; context.shadowColor = COLORS.copper; context.shadowBlur = 8;
//         context.stroke(); context.shadowBlur = 0; return true;
//       });

//       pads.forEach(({ x, y }) => {
//         const distance = mouse.active ? Math.hypot(x - mouse.x, y - mouse.y) : Infinity;
//         const strength = distance < REACT_DIST ? 1 - distance / REACT_DIST : 0;
//         context.beginPath(); context.arc(x, y, strength ? 2 + strength * 2 : 1.6, 0, Math.PI * 2);
//         context.fillStyle = strength ? `rgba(94,234,240,${0.4 + strength * 0.6})` : 'rgba(217,154,91,0.35)';
//         context.shadowColor = strength ? COLORS.cyan : 'transparent'; context.shadowBlur = 8 * strength;
//         context.fill(); context.shadowBlur = 0;
//       });

//       turrets.forEach((turret) => {
//         const target = mouse.active ? Math.atan2(mouse.y - turret.baseY, mouse.x - turret.baseX) : turret.restAngle + (reducedMotion ? 0 : Math.sin(now / 2000 + turret.idlePhaseA) * 0.16 + Math.cos(now / 2600 + turret.idlePhaseB) * 0.1);
//         const ease = clamp(delta * 60, 0, 2);
//         turret.angle1 = reducedMotion ? target : lerpAngle(turret.angle1, target, turret.ease1 * ease);
//         turret.angle2 = reducedMotion ? target : lerpAngle(turret.angle2, turret.angle1, turret.ease2 * ease);
//         const elbowX = turret.baseX + Math.cos(turret.angle1) * turret.len1; const elbowY = turret.baseY + Math.sin(turret.angle1) * turret.len1;
//         const tipX = elbowX + Math.cos(turret.angle2) * turret.len2; const tipY = elbowY + Math.sin(turret.angle2) * turret.len2;
//         const boost = mouse.active ? smoothBoost(Math.hypot(tipX - mouse.x, tipY - mouse.y), REACT_DIST) : 0;
//         context.beginPath(); context.moveTo(turret.baseX, turret.baseY); context.lineTo(elbowX, elbowY); context.lineTo(tipX, tipY);
//         context.strokeStyle = `rgba(150,178,192,${0.3 + boost * 0.4})`; context.lineWidth = 1.2; context.stroke();
//         context.beginPath(); context.arc(tipX, tipY, 1.8 + boost * 1.6, 0, Math.PI * 2);
//         context.fillStyle = `rgba(94,234,240,${0.35 + boost * 0.55})`; context.fill();
//       });
//     }

//     const requestNextFrame = (now) => { draw(now); animationFrameRef.current = requestAnimationFrame(requestNextFrame); };
//     const redraw = () => draw(performance.now());
//     const onPointerMove = (event) => {
//       const rect = wrapper.getBoundingClientRect();
//       mouseRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
//       if (reducedMotion) redraw();
//     };
//     const onPointerLeave = () => { mouseRef.current.active = false; if (reducedMotion) redraw(); };
//     const onResize = () => { setup(); redraw(); };

//     setup();
//     const resizeObserver = new ResizeObserver(onResize);
//     resizeObserver.observe(wrapper);
//     wrapper.addEventListener('pointermove', onPointerMove);
//     wrapper.addEventListener('pointerleave', onPointerLeave);
//     if (reducedMotion) redraw(); else animationFrameRef.current = requestAnimationFrame(requestNextFrame);

//     return () => {
//       cancelAnimationFrame(animationFrameRef.current);
//       resizeObserver.disconnect();
//       wrapper.removeEventListener('pointermove', onPointerMove);
//       wrapper.removeEventListener('pointerleave', onPointerLeave);
//     };
//   }, []);

//   return (
//     <div ref={wrapperRef} className={className} style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden', background: 'linear-gradient(160deg, #070a0e 0%, #0c131b 55%, #090d12 100%)', ...style }}>
//       <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
//       <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
//     </div>
//   );
// }


import React, { useEffect, useRef } from 'react';

const GRID = 24;
const REACT_DIST = 150;
const COLORS = {
  dormant: (alpha) => `rgba(138,164,178,${alpha})`,
  copper: '#d99a5b',
  cyan: '#5eeaf0',
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const snap = (value) => Math.round(value / GRID) * GRID;

function smoothBoost(distance, radius) {
  const t = clamp(1 - distance / radius, 0, 1);
  return t * t * (3 - 2 * t);
}

function lerpAngle(from, to, amount) {
  let difference = (to - from) % (Math.PI * 2);
  if (difference > Math.PI) difference -= Math.PI * 2;
  if (difference < -Math.PI) difference += Math.PI * 2;
  return from + difference * amount;
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  const t = clamp(lengthSquared === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lengthSquared, 0, 1);
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}

function buildBoard(width, height) {
  const traces = [];
  const pads = [];
  const traceCount = Math.floor((width * height) / 32000);

  for (let index = 0; index < traceCount; index += 1) {
    let x = snap(Math.random() * width);
    let y = snap(Math.random() * height);
    const points = [{ x, y }];
    const segments = 2 + Math.floor(Math.random() * 3);

    for (let segment = 0; segment < segments; segment += 1) {
      const length = GRID * (2 + Math.floor(Math.random() * 6));
      if (Math.random() < 0.5) {
        x = clamp(snap(x + (Math.random() < 0.5 ? -length : length)), 0, width);
      } else {
        y = clamp(snap(y + (Math.random() < 0.5 ? -length : length)), 0, height);
      }
      points.push({ x, y });
    }

    traces.push({ points, flow: 0 });
    pads.push(points[0], points[points.length - 1]);
  }

  const chips = Array.from({ length: Math.floor((width * height) / 150000) }, () => {
    const w = GRID * 3;
    const h = GRID * 2;
    return { x: snap(Math.random() * (width - w)), y: snap(Math.random() * (height - h)), w, h, seed: Math.random() * Math.PI * 2 };
  });

  const vias = Array.from({ length: Math.floor((width * height) / 26000) }, () => ({
    x: snap(Math.random() * width),
    y: snap(Math.random() * height),
  }));

  const turrets = Array.from({ length: Math.floor((width * height) / 420000) }, () => {
    const restAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    return {
      baseX: Math.random() * width, baseY: Math.random() * height,
      len1: 10 + Math.random() * 6, len2: 9 + Math.random() * 5,
      angle1: restAngle, angle2: restAngle, restAngle,
      ease1: 0.05 + Math.random() * 0.04, ease2: 0.03 + Math.random() * 0.03,
      idlePhaseA: Math.random() * 1000, idlePhaseB: Math.random() * 1000,
    };
  });

  return { traces, pads, chips, vias, turrets };
}

/** A full-container PCB canvas background. Place your application inside `children`. */
export default function PcbCircuitBackground({ children, className = '' }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const worldRef = useRef({ traces: [], pads: [], chips: [], vias: [], turrets: [] });
  const pulsesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!wrapper || !canvas || !context) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastTime = performance.now();
    let lastPulseAt = 0;

    function setup() {
      const { width, height } = wrapper.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      worldRef.current = buildBoard(width, height);
      pulsesRef.current = [];
    }

    function draw(now) {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const { traces, pads, chips, vias, turrets } = worldRef.current;
      const { width, height } = wrapper.getBoundingClientRect();
      const mouse = mouseRef.current;
      context.clearRect(0, 0, width, height);

      vias.forEach(({ x, y }) => {
        context.beginPath(); context.arc(x, y, 1, 0, Math.PI * 2);
        context.fillStyle = COLORS.dormant(0.12); context.fill();
      });

      chips.forEach((chip) => {
        const distance = mouse.active ? Math.hypot(mouse.x - chip.x - chip.w / 2, mouse.y - chip.y - chip.h / 2) : Infinity;
        const boost = mouse.active ? smoothBoost(distance, REACT_DIST) : 0;
        const flicker = reducedMotion ? 0.12 : 0.12 + 0.08 * Math.sin(now / 900 + chip.seed);
        const glow = clamp(flicker + boost, 0, 0.9);
        context.strokeStyle = boost > 0.15 ? `rgba(94,234,240,${0.25 + glow * 0.5})` : `rgba(217,154,91,${0.2 + glow * 0.4})`;
        context.lineWidth = 1;
        if (boost > 0.15) { context.shadowColor = COLORS.cyan; context.shadowBlur = 8 * boost; }
        context.strokeRect(chip.x, chip.y, chip.w, chip.h); context.shadowBlur = 0;
        for (let pin = chip.x + 6; pin < chip.x + chip.w; pin += 8) {
          context.beginPath(); context.moveTo(pin, chip.y); context.lineTo(pin, chip.y - 4);
          context.moveTo(pin, chip.y + chip.h); context.lineTo(pin, chip.y + chip.h + 4);
          context.strokeStyle = `rgba(217,154,91,${0.15 + glow * 0.25})`; context.stroke();
        }
      });

      traces.forEach((trace) => {
        let distance = Infinity;
        if (mouse.active) for (let index = 0; index < trace.points.length - 1; index += 1) {
          const a = trace.points[index]; const b = trace.points[index + 1];
          distance = Math.min(distance, distanceToSegment(mouse.x, mouse.y, a.x, a.y, b.x, b.y));
        }
        const near = mouse.active && distance < REACT_DIST;
        context.beginPath(); context.moveTo(trace.points[0].x, trace.points[0].y);
        trace.points.slice(1).forEach(({ x, y }) => context.lineTo(x, y));
        if (near) {
          trace.flow += 0.6; context.setLineDash([6, 6]); context.lineDashOffset = -trace.flow;
          context.strokeStyle = `rgba(94,234,240,${0.25 + (1 - distance / REACT_DIST) * 0.65})`;
          context.lineWidth = 1.5; context.shadowColor = COLORS.cyan; context.shadowBlur = 6 * (1 - distance / REACT_DIST);
        } else { context.setLineDash([]); context.strokeStyle = COLORS.dormant(0.14); context.lineWidth = 1; }
        context.stroke(); context.setLineDash([]); context.shadowBlur = 0;
      });

      if (!reducedMotion && now - lastPulseAt > 260 && pulsesRef.current.length < 28 && traces.length) {
        const trace = traces[Math.floor(Math.random() * traces.length)];
        pulsesRef.current.push({ trace, segment: Math.floor(Math.random() * (trace.points.length - 1)), t: 0, speed: 0.45 + Math.random() * 0.35 });
        lastPulseAt = now;
      }
      pulsesRef.current = pulsesRef.current.filter((pulse) => {
        pulse.t += pulse.speed * delta;
        if (pulse.t >= 1) return false;
        const a = pulse.trace.points[pulse.segment]; const b = pulse.trace.points[pulse.segment + 1];
        context.beginPath(); context.moveTo(a.x + (b.x - a.x) * Math.max(0, pulse.t - 0.12), a.y + (b.y - a.y) * Math.max(0, pulse.t - 0.12));
        context.lineTo(a.x + (b.x - a.x) * pulse.t, a.y + (b.y - a.y) * pulse.t);
        context.strokeStyle = 'rgba(217,154,91,0.9)'; context.lineWidth = 2; context.shadowColor = COLORS.copper; context.shadowBlur = 8;
        context.stroke(); context.shadowBlur = 0; return true;
      });

      pads.forEach(({ x, y }) => {
        const distance = mouse.active ? Math.hypot(x - mouse.x, y - mouse.y) : Infinity;
        const strength = distance < REACT_DIST ? 1 - distance / REACT_DIST : 0;
        context.beginPath(); context.arc(x, y, strength ? 2 + strength * 2 : 1.6, 0, Math.PI * 2);
        context.fillStyle = strength ? `rgba(94,234,240,${0.4 + strength * 0.6})` : 'rgba(217,154,91,0.35)';
        context.shadowColor = strength ? COLORS.cyan : 'transparent'; context.shadowBlur = 8 * strength;
        context.fill(); context.shadowBlur = 0;
      });

      turrets.forEach((turret) => {
        const target = mouse.active ? Math.atan2(mouse.y - turret.baseY, mouse.x - turret.baseX) : turret.restAngle + (reducedMotion ? 0 : Math.sin(now / 2000 + turret.idlePhaseA) * 0.16 + Math.cos(now / 2600 + turret.idlePhaseB) * 0.1);
        const ease = clamp(delta * 60, 0, 2);
        turret.angle1 = reducedMotion ? target : lerpAngle(turret.angle1, target, turret.ease1 * ease);
        turret.angle2 = reducedMotion ? target : lerpAngle(turret.angle2, turret.angle1, turret.ease2 * ease);
        const elbowX = turret.baseX + Math.cos(turret.angle1) * turret.len1; const elbowY = turret.baseY + Math.sin(turret.angle1) * turret.len1;
        const tipX = elbowX + Math.cos(turret.angle2) * turret.len2; const tipY = elbowY + Math.sin(turret.angle2) * turret.len2;
        const boost = mouse.active ? smoothBoost(Math.hypot(tipX - mouse.x, tipY - mouse.y), REACT_DIST) : 0;
        context.beginPath(); context.moveTo(turret.baseX, turret.baseY); context.lineTo(elbowX, elbowY); context.lineTo(tipX, tipY);
        context.strokeStyle = `rgba(150,178,192,${0.3 + boost * 0.4})`; context.lineWidth = 1.2; context.stroke();
        context.beginPath(); context.arc(tipX, tipY, 1.8 + boost * 1.6, 0, Math.PI * 2);
        context.fillStyle = `rgba(94,234,240,${0.35 + boost * 0.55})`; context.fill();
      });
    }

    const requestNextFrame = (now) => { draw(now); animationFrameRef.current = requestAnimationFrame(requestNextFrame); };
    const redraw = () => draw(performance.now());
    const onPointerMove = (event) => {
      const rect = wrapper.getBoundingClientRect();
      mouseRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
      if (reducedMotion) redraw();
    };
    const onPointerLeave = () => { mouseRef.current.active = false; if (reducedMotion) redraw(); };
    const onResize = () => { setup(); redraw(); };

    setup();
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(wrapper);
    wrapper.addEventListener('pointermove', onPointerMove);
    wrapper.addEventListener('pointerleave', onPointerLeave);
    if (reducedMotion) redraw(); else animationFrameRef.current = requestAnimationFrame(requestNextFrame);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
      wrapper.removeEventListener('pointermove', onPointerMove);
      wrapper.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`relative min-h-screen w-full overflow-hidden bg-[linear-gradient(160deg,#070a0e_0%,#0c131b_55%,#090d12_100%)] ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
