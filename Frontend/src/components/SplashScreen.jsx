import { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';
import ANARC from "./../assets/AnarcLogo.png";

// ─── SideRays (beam engine — untouched logic, ANARC colours applied) ──────────

const hexToRgb = hex => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};

const SideRays = ({
  speed = 2.5,
  rayColor1 = '#5eeaf0',   // ANARC cyan
  rayColor2 = '#5eeaf0',
  //rayColor2 = '#d99a5b',   // ANARC amber/gold
  intensity = 2,
  spread = 2,
  origin = 'top-right',
  tilt = 0,
  saturation = 1.5,
  blend = 0.75,
  falloff = 1.6,
  opacity = 1.0,
  className = ''
}) => {
  const containerRef = useRef(null);
  const uniformsRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);
  const meshRef = useRef(null);
  const cleanupFunctionRef = useRef(null);

  const originToFlip = o => {
    switch (o) {
      case 'top-left':     return [1, 0];
      case 'bottom-right': return [0, 1];
      case 'bottom-left':  return [1, 1];
      default:             return [0, 0]; // top-right
    }
  };

  // No IntersectionObserver — splash is always visible, start WebGL immediately
  useEffect(() => {
    if (!containerRef.current) return;
    cleanupFunctionRef.current?.();
    cleanupFunctionRef.current = null;

    const initializeWebGL = async () => {
      if (!containerRef.current) return;
      await new Promise(r => setTimeout(r, 10));
      if (!containerRef.current) return;

      const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
      rendererRef.current = renderer;
      const gl = renderer.gl;
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      while (containerRef.current.firstChild) containerRef.current.removeChild(containerRef.current.firstChild);
      containerRef.current.appendChild(gl.canvas);

      const vert = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
      const frag = `precision highp float;
uniform float iTime; uniform vec2 iResolution; uniform float iSpeed;
uniform vec3 iRayColor1; uniform vec3 iRayColor2;
uniform float iIntensity,iSpread,iFlipX,iFlipY,iTilt,iSaturation,iBlend,iFalloff,iOpacity;

float rayStrength(vec2 src,vec2 dir,vec2 coord,float a,float b,float spd){
  vec2 d=coord-src; float c=dot(normalize(d),dir);
  return clamp((.45+.15*sin(c*a+iTime*spd))+(.3+.2*cos(-c*b+iTime*spd)),0.,1.)
        *clamp((iResolution.x-length(d))/iResolution.x,.5,1.);
}

void main(){
  vec2 fc=gl_FragCoord.xy;
  if(iFlipX>.5) fc.x=iResolution.x-fc.x;
  if(iFlipY>.5) fc.y=iResolution.y-fc.y;
  vec2 coord=vec2(fc.x,iResolution.y-fc.y);
  vec2 rayPos=vec2(iResolution.x*1.1,-0.5*iResolution.y);
  float tr=iTilt*3.14159265/180.; float cs=cos(tr),sn=sin(tr);
  vec2 rel=coord-rayPos;
  vec2 tc=vec2(rel.x*cs-rel.y*sn,rel.x*sn+rel.y*cs)+rayPos;
  float hs=iSpread*.275;
  vec2 d1=normalize(vec2(cos(.785398+hs),sin(.785398+hs)));
  vec2 d2=normalize(vec2(cos(.785398-hs),sin(.785398-hs)));
  vec4 r1=vec4(iRayColor1,1.)*rayStrength(rayPos,d1,tc,36.2214,21.11349,iSpeed);
  vec4 r2=vec4(iRayColor2,1.)*rayStrength(rayPos,d2,tc,22.3991,18.0234,iSpeed*.2);
  vec4 color=r1*(1.-iBlend)*.9+r2*iBlend*.9;
  float dist=length(fc-vec2(rayPos.x,iResolution.y-rayPos.y))/iResolution.y;
  float brightness=iIntensity*.4/pow(max(dist,.001),iFalloff);
  color.rgb*=brightness;
  float gray=dot(color.rgb,vec3(.299,.587,.114));
  color.rgb=mix(vec3(gray),color.rgb,iSaturation);
  color.a=max(color.r,max(color.g,color.b))*iOpacity;
  gl_FragColor=color;
}`;

      const [flipX, flipY] = originToFlip(origin);
      const uniforms = {
        iTime:      { value: 0 },
        iResolution:{ value: [1, 1] },
        iSpeed:     { value: speed },
        iRayColor1: { value: hexToRgb(rayColor1) },
        iRayColor2: { value: hexToRgb(rayColor2) },
        iIntensity: { value: intensity },
        iSpread:    { value: spread },
        iFlipX:     { value: flipX },
        iFlipY:     { value: flipY },
        iTilt:      { value: tilt },
        iSaturation:{ value: saturation },
        iBlend:     { value: blend },
        iFalloff:   { value: falloff },
        iOpacity:   { value: opacity },
      };
      uniformsRef.current = uniforms;

      const geometry = new Triangle(gl);
      const program  = new Program(gl, { vertex: vert, fragment: frag, uniforms });
      const mesh     = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      const updateSize = () => {
        if (!containerRef.current || !renderer) return;
        renderer.dpr = Math.min(window.devicePixelRatio, 2);
        const { clientWidth: w, clientHeight: h } = containerRef.current;
        renderer.setSize(w, h);
        uniforms.iResolution.value = [w * renderer.dpr, h * renderer.dpr];
      };

      const loop = t => {
        if (!rendererRef.current || !uniformsRef.current || !meshRef.current) return;
        uniforms.iTime.value = t * 0.001;
        try { renderer.render({ scene: mesh }); animationIdRef.current = requestAnimationFrame(loop); }
        catch { return; }
      };

      window.addEventListener('resize', updateSize);
      updateSize();
      animationIdRef.current = requestAnimationFrame(loop);

      cleanupFunctionRef.current = () => {
        if (animationIdRef.current) { cancelAnimationFrame(animationIdRef.current); animationIdRef.current = null; }
        window.removeEventListener('resize', updateSize);
        try {
          const loseCtx = renderer.gl.getExtension('WEBGL_lose_context');
          if (loseCtx) loseCtx.loseContext();
          const canvas = renderer.gl.canvas;
          if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
        } catch {}
        rendererRef.current = uniformsRef.current = meshRef.current = null;
      };
    };

    initializeWebGL();
    return () => { cleanupFunctionRef.current?.(); cleanupFunctionRef.current = null; };
  }, [speed, rayColor1, rayColor2, intensity, spread, origin, tilt, saturation, blend, falloff, opacity]);

  useEffect(() => {
    if (!uniformsRef.current) return;
    const u = uniformsRef.current;
    u.iSpeed.value = speed; u.iRayColor1.value = hexToRgb(rayColor1);
    u.iRayColor2.value = hexToRgb(rayColor2); u.iIntensity.value = intensity;
    u.iSpread.value = spread; const [fx, fy] = originToFlip(origin);
    u.iFlipX.value = fx; u.iFlipY.value = fy; u.iTilt.value = tilt;
    u.iSaturation.value = saturation; u.iBlend.value = blend;
    u.iFalloff.value = falloff; u.iOpacity.value = opacity;
  }, [speed, rayColor1, rayColor2, intensity, spread, origin, tilt, saturation, blend, falloff, opacity]);

  return (
    <div ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`.trim()} />
  );
};


export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('visible'); // 'visible' → 'fading' → 'gone'

  useEffect(() => {
    // Hold for 2.4 s, then fade over 0.6 s
    const hold  = setTimeout(() => setPhase('fading'), 2400);
    const clear = setTimeout(() => { setPhase('gone'); onDone?.(); }, 3000);
    return () => { clearTimeout(hold); clearTimeout(clear); };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: '#07080c',
        opacity:    phase === 'fading' ? 0 : 1,
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: phase === 'fading' ? 'none' : 'auto',
      }}
    >
      {/* ── Beam — top-right corner, ANARC cyan + amber ── */}
      <SideRays
        origin="top-right"
        rayColor1="#5eeaf0"   // ANARC primary cyan
        rayColor2="#d99a5b"   // ANARC amber/gold
        speed={1.8}
        intensity={2.2}
        spread={1.6}
        blend={0.6}
        saturation={1.8}
        falloff={1.5}
        opacity={0.9}
        tilt={0}
      />

      {/* ── Center content ── */}
      <div className="relative z-10 flex flex-col items-center gap-5 select-none">

        {/* Logo — plain, no extra styling */}
        <img
          src={ANARC}
          alt="ANARC"
          className="w-24 h-24 object-contain"
        />

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-[2rem] font-[650] tracking-[-0.04em] leading-none"
            style={{
              fontFamily: "'Sora', ui-sans-serif",
              color: '#d7f9fa',            // ANARC heading cyan-white
            }}
          >
            ANARC
          </span>

          {/* Amber rule + monospace label — matches EventsSection eyebrow */}
          <div className="flex items-center gap-2 mt-1">
            <div
              className="h-px w-5"
              style={{ background: '#d99a5b', boxShadow: '0 0 6px rgba(217,154,91,0.8)' }}
            />
            <span
              className="text-[0.68rem] font-bold tracking-[0.2em]"
              style={{ fontFamily: "'DM Mono', monospace", color: '#8fd8dd' }}
            >
              LOADING
            </span>
            <div
              className="h-px w-5"
              style={{ background: '#d99a5b', boxShadow: '0 0 6px rgba(217,154,91,0.8)' }}
            />
          </div>
        </div>

        {/* Spinner — matches EventsSection loader colour */}
        <div
          className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin mt-1"
          style={{ borderColor: '#4dd9e8 transparent #4dd9e8 #4dd9e8' }}
        />
      </div>
    </div>
  );
}