// import React, { useEffect, useRef } from 'react';

// const CircuitBackgroundOne = () => {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');
//     let width, height;
//     const mouse = { x: -9999, y: -9999 };
//     const GRID = 24;
//     const REACT_DIST = 150;
    
//     let traces = [];
//     let pads = [];
//     let chips = [];
//     let animationFrameId;

//     const snap = (v) => Math.round(v / GRID) * GRID;

//     const resize = () => {
//       width = canvas.width = window.innerWidth;
//       height = canvas.height = window.innerHeight;
//     };

//     const buildBoard = () => {
//       traces = [];
//       pads = [];
//       chips = [];

//       const traceCount = Math.floor((width * height) / 55000);

//       for (let i = 0; i < traceCount; i++) {
//         let x = snap(Math.random() * width);
//         let y = snap(Math.random() * height);
//         const points = [{ x, y }];

//         const segments = 2 + Math.floor(Math.random() * 3);
//         for (let s = 0; s < segments; s++) {
//           const horizontal = Math.random() < 0.5;
//           const length = GRID * (2 + Math.floor(Math.random() * 6));
//           if (horizontal) {
//             x = snap(x + (Math.random() < 0.5 ? -length : length));
//             x = Math.max(0, Math.min(width, x));
//           } else {
//             y = snap(y + (Math.random() < 0.5 ? -length : length));
//             y = Math.max(0, Math.min(height, y));
//           }
//           points.push({ x, y });
//         }

//         traces.push({ points, flow: 0 });
//         pads.push(points[0]);
//         pads.push(points[points.length - 1]);
//       }

//       const chipCount = Math.floor((width * height) / 260000);
//       for (let i = 0; i < chipCount; i++) {
//         const w = GRID * 3, h = GRID * 2;
//         chips.push({
//           x: snap(Math.random() * (width - w)),
//           y: snap(Math.random() * (height - h)),
//           w, h
//         });
//       }
//     };

//     const handleMouseMove = (e) => {
//       mouse.x = e.clientX;
//       mouse.y = e.clientY;
//     };

//     const handleMouseLeave = () => {
//       mouse.x = -9999;
//       mouse.y = -9999;
//     };

//     const handleResize = () => {
//       resize();
//       buildBoard();
//     };

//     // Event Listeners
//     window.addEventListener('mousemove', handleMouseMove);
//     window.addEventListener('mouseleave', handleMouseLeave);
//     window.addEventListener('resize', handleResize);

//     // Initial Setup
//     resize();
//     buildBoard();

//     const pointToSegDist = (px, py, x1, y1, x2, y2) => {
//       const dx = x2 - x1, dy = y2 - y1;
//       const lenSq = dx * dx + dy * dy;
//       let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
//       t = Math.max(0, Math.min(1, t));
//       const cx = x1 + t * dx, cy = y1 + t * dy;
//       return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
//     };

//     const traceMinDist = (trace) => {
//       let min = Infinity;
//       for (let i = 0; i < trace.points.length - 1; i++) {
//         const a = trace.points[i], b = trace.points[i + 1];
//         const d = pointToSegDist(mouse.x, mouse.y, a.x, a.y, b.x, b.y);
//         if (d < min) min = d;
//       }
//       return min;
//     };

//     const draw = () => {
//       ctx.clearRect(0, 0, width, height);

//       for (const c of chips) {
//         ctx.strokeStyle = 'rgba(120, 140, 170, 0.18)';
//         ctx.lineWidth = 1;
//         ctx.strokeRect(c.x, c.y, c.w, c.h);
//         for (let px = c.x + 6; px < c.x + c.w; px += 8) {
//           ctx.beginPath();
//           ctx.moveTo(px, c.y);
//           ctx.lineTo(px, c.y - 4);
//           ctx.moveTo(px, c.y + c.h);
//           ctx.lineTo(px, c.y + c.h + 4);
//           ctx.strokeStyle = 'rgba(120, 140, 170, 0.15)';
//           ctx.stroke();
//         }
//       }

//       for (const trace of traces) {
//         const dist = traceMinDist(trace);
//         const near = dist < REACT_DIST;
//         const strength = near ? 1 - dist / REACT_DIST : 0;

//         ctx.beginPath();
//         ctx.moveTo(trace.points[0].x, trace.points[0].y);
//         for (let i = 1; i < trace.points.length; i++) {
//           ctx.lineTo(trace.points[i].x, trace.points[i].y);
//         }

//         if (near) {
//           trace.flow += 0.6;
//           ctx.setLineDash([6, 6]);
//           ctx.lineDashOffset = -trace.flow;
//           ctx.strokeStyle = `rgba(59, 130, 246, ${0.25 + strength * 0.65})`;
//           ctx.lineWidth = 1.5;
//         } else {
//           ctx.setLineDash([]);
//           ctx.strokeStyle = 'rgba(110, 130, 160, 0.14)';
//           ctx.lineWidth = 1;
//         }
//         ctx.stroke();
//         ctx.setLineDash([]);
//       }

//       for (const p of pads) {
//         const dx = p.x - mouse.x, dy = p.y - mouse.y;
//         const dist = Math.sqrt(dx * dx + dy * dy);
//         const near = dist < REACT_DIST;
//         const strength = near ? 1 - dist / REACT_DIST : 0;

//         ctx.beginPath();
//         ctx.arc(p.x, p.y, near ? 2 + strength * 2 : 1.6, 0, Math.PI * 2);
//         ctx.fillStyle = near
//           ? `rgba(212, 165, 116, ${0.4 + strength * 0.6})`
//           : 'rgba(110, 130, 160, 0.3)';
//         ctx.fill();
//       }

//       animationFrameId = requestAnimationFrame(draw);
//     };

//     draw();

//     // Cleanup when component is unmounted
//     return () => {
//       window.removeEventListener('mousemove', handleMouseMove);
//       window.removeEventListener('mouseleave', handleMouseLeave);
//       window.removeEventListener('resize', handleResize);
//       cancelAnimationFrame(animationFrameId);
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         width: '100vw',
//         height: '100vh',
//         zIndex: -1, // Puts canvas safely behind your HTML content
//         pointerEvents: 'none', // Allows clicks to pass through to items underneath
//         backgroundColor: '#0f172a' // Optional: Slate dark mode background color
//       }}
//     />
//   );
// };

// export default CircuitBackgroundOne;


import React, { useEffect, useRef } from 'react';

const CircuitBackgroundOne = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    const mouse = { x: -9999, y: -9999 };
    const GRID = 24;
    const REACT_DIST = 150;
    
    let traces = [];
    let pads = [];
    let chips = [];
    let animationFrameId;

    const snap = (v) => Math.round(v / GRID) * GRID;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const buildBoard = () => {
      traces = [];
      pads = [];
      chips = [];

      const traceCount = Math.floor((width * height) / 55000);

      for (let i = 0; i < traceCount; i++) {
        let x = snap(Math.random() * width);
        let y = snap(Math.random() * height);
        const points = [{ x, y }];

        const segments = 2 + Math.floor(Math.random() * 3);
        for (let s = 0; s < segments; s++) {
          const horizontal = Math.random() < 0.5;
          const length = GRID * (2 + Math.floor(Math.random() * 6));
          if (horizontal) {
            x = snap(x + (Math.random() < 0.5 ? -length : length));
            x = Math.max(0, Math.min(width, x));
          } else {
            y = snap(y + (Math.random() < 0.5 ? -length : length));
            y = Math.max(0, Math.min(height, y));
          }
          points.push({ x, y });
        }

        traces.push({ points, flow: 0 });
        pads.push(points[0]);
        pads.push(points[points.length - 1]);
      }

      const chipCount = Math.floor((width * height) / 260000);
      for (let i = 0; i < chipCount; i++) {
        const w = GRID * 3, h = GRID * 2;
        chips.push({
          x: snap(Math.random() * (width - w)),
          y: snap(Math.random() * (height - h)),
          w, h
        });
      }
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const handleResize = () => {
      resize();
      buildBoard();
    };

    // Event Listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Initial Setup
    resize();
    buildBoard();

    const pointToSegDist = (px, py, x1, y1, x2, y2) => {
      const dx = x2 - x1, dy = y2 - y1;
      const lenSq = dx * dx + dy * dy;
      let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const cx = x1 + t * dx, cy = y1 + t * dy;
      return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    };

    const traceMinDist = (trace) => {
      let min = Infinity;
      for (let i = 0; i < trace.points.length - 1; i++) {
        const a = trace.points[i], b = trace.points[i + 1];
        const d = pointToSegDist(mouse.x, mouse.y, a.x, a.y, b.x, b.y);
        if (d < min) min = d;
      }
      return min;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const c of chips) {
        ctx.strokeStyle = 'rgba(120, 140, 170, 0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(c.x, c.y, c.w, c.h);
        for (let px = c.x + 6; px < c.x + c.w; px += 8) {
          ctx.beginPath();
          ctx.moveTo(px, c.y);
          ctx.lineTo(px, c.y - 4);
          ctx.moveTo(px, c.y + c.h);
          ctx.lineTo(px, c.y + c.h + 4);
          ctx.strokeStyle = 'rgba(120, 140, 170, 0.15)';
          ctx.stroke();
        }
      }

      for (const trace of traces) {
        const dist = traceMinDist(trace);
        const near = dist < REACT_DIST;
        const strength = near ? 1 - dist / REACT_DIST : 0;

        ctx.beginPath();
        ctx.moveTo(trace.points[0].x, trace.points[0].y);
        for (let i = 1; i < trace.points.length; i++) {
          ctx.lineTo(trace.points[i].x, trace.points[i].y);
        }

        if (near) {
          trace.flow += 0.6;
          ctx.setLineDash([6, 6]);
          ctx.lineDashOffset = -trace.flow;
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.25 + strength * 0.65})`;
          ctx.lineWidth = 1.5;
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = 'rgba(110, 130, 160, 0.14)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      for (const p of pads) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const near = dist < REACT_DIST;
        const strength = near ? 1 - dist / REACT_DIST : 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, near ? 2 + strength * 2 : 1.6, 0, Math.PI * 2);
        ctx.fillStyle = near
          ? `rgba(212, 165, 116, ${0.4 + strength * 0.6})`
          : 'rgba(110, 130, 160, 0.3)';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Cleanup when component is unmounted
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen -z-10 pointer-events-none bg-slate-900"
    />
  );
};

export default CircuitBackgroundOne;