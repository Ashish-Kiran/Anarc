import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function HeroSection({
  eyebrow = "ASIMOV · NIT AGARTALA ROBOTICS CLUB",
  title = "We build the machines that learn to move.",
  subtitle =
    "Autonomous rovers, embedded systems, and open builds from a lab that runs on solder smoke and late-night debugging. Move your cursor across the board.",
  ctaLabel = "Join Us",
  onCtaClick,
  meta = "Currently probing: line-follower & sand-rover-v2",
}) {
  // Container where Three.js canvas will be mounted
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // ============================================================
    // SCENE
    // ============================================================

    const scene = new THREE.Scene();

    // ============================================================
    // CAMERA
    // ============================================================

    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    camera.position.set(0, 1.4, 3.2);

    // ============================================================
    // RENDERER
    // ============================================================

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    container.appendChild(renderer.domElement);

    // ============================================================
    // LIGHTING
    // ============================================================

    const keyLight = new THREE.DirectionalLight(0xffffff, 2);

    keyLight.position.set(2, 3, 2);

    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(
      0x4d8cff,
      1
    );

    fillLight.position.set(-2, 1, -1);

    scene.add(fillLight);

    const ambient = new THREE.AmbientLight(
      0xffffff,
      0.4
    );

    scene.add(ambient);

    // ============================================================
    // LOAD ROBOT MODEL
    // ============================================================

    let headBone = null;
    let robotModel = null;

    const loader = new GLTFLoader();

    loader.load(
      "/robot.glb",

      // SUCCESS
      (gltf) => {
        robotModel = gltf.scene;

        scene.add(robotModel);

        // ========================================================
        // ROBOT PLACEMENT
        // ========================================================

        robotModel.scale.set(1, 1, 1);

        robotModel.position.set(0, 0, 0);

        // ========================================================
        // FIND HEAD BONE
        // ========================================================

        robotModel.traverse((child) => {
          if (
            child.isBone &&
            /head/i.test(child.name)
          ) {
            headBone = child;
          }
        });

        if (headBone) {
          console.log(
            "Head bone found:",
            headBone.name
          );
        } else {
          console.log(
            "No head bone found — will tilt whole model instead"
          );
        }
      },

      // PROGRESS
      (progress) => {
        if (progress.total) {
          console.log(
            "Loading model...",
            (
              (progress.loaded / progress.total) *
              100
            ).toFixed(0) + "%"
          );
        }
      },

      // ERROR
      (error) => {
        console.error(
          "Error loading model:",
          error
        );
      }
    );

    // ============================================================
    // CURSOR TRACKING
    // ============================================================

    const mouse = {
      x: 0,
      y: 0,
    };

    const handleMouseMove = (e) => {
      const rect =
        container.getBoundingClientRect();

      // Convert mouse position to -1 ... +1
      mouse.x =
        ((e.clientX - rect.left) /
          rect.width) *
          2 -
        1;

      mouse.y =
        ((e.clientY - rect.top) /
          rect.height) *
          2 -
        1;
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    // Maximum head rotation
    const MAX_ANGLE = 0.35;

    // ============================================================
    // ANIMATION
    // ============================================================

    let frameId;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (robotModel) {
        const targetY =
          mouse.x * MAX_ANGLE;

        const targetX =
          mouse.y * MAX_ANGLE * 0.5;

        // If head bone exists,
        // rotate only the head
        if (headBone) {
          headBone.rotation.y +=
            (targetY -
              headBone.rotation.y) *
            0.1;

          headBone.rotation.x +=
            (targetX -
              headBone.rotation.x) *
            0.1;
        }

        // Otherwise rotate entire robot
        else {
          robotModel.rotation.y +=
            (targetY * 0.5 -
              robotModel.rotation.y) *
            0.1;
        }
      }

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    // ============================================================
    // HANDLE RESIZE
    // ============================================================

    const handleResize = () => {
      if (!containerRef.current) return;

      const {
        clientWidth,
        clientHeight,
      } = containerRef.current;

      if (
        clientWidth === 0 ||
        clientHeight === 0
      ) {
        return;
      }

      camera.aspect =
        clientWidth / clientHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        clientWidth,
        clientHeight
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    // ============================================================
    // CLEANUP
    // ============================================================

    return () => {
      cancelAnimationFrame(frameId);

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      renderer.dispose();

      if (
        renderer.domElement &&
        renderer.domElement.parentNode ===
          container
      ) {
        container.removeChild(
          renderer.domElement
        );
      }

      // Dispose robot resources
      if (robotModel) {
        robotModel.traverse((child) => {
          if (child.geometry) {
            child.geometry.dispose();
          }

          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(
                (material) => material.dispose()
              );
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, []);

  return (
    <div className="w-full min-h-screen mx-auto px-[15px] box-border">

      <style>{`
        @keyframes hero-blink {
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: 0.35;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-dot {
            animation: none !important;
          }
        }

        #robot-canvas-mount canvas {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
      `}</style>

      <section
        className="
          relative
          w-full
          min-h-screen
          box-border
          grid
          grid-cols-1
          lg:grid-cols-2
          items-center
          gap-8
          lg:gap-[60px]
          px-[15px]
          py-10
          font-[ui-sans-serif,_system-ui,_-apple-system,_sans-serif]

          max-lg:bg-[linear-gradient(to_bottom,rgba(20,24,31,0.8)_0%,rgba(20,24,31,0.5)_50%,rgba(20,24,31,0.15)_85%,transparent_100%)]
        "
      >

        {/* ======================================================
            LEFT SIDE
        ====================================================== */}

        <div className="text-left flex flex-col ml-30">

          {/* Eyebrow */}

          <span
            className="
              order-1
              inline-flex
              items-center
              gap-2
              w-fit
              font-[ui-monospace,_'JetBrains_Mono',_'SFMono-Regular',_monospace]
              text-xs
              tracking-[0.14em]
              uppercase
              text-[#8fd8dd]
              mb-5
            "
          >
            <span
              className="
                hero-dot
                w-1.5
                h-1.5
                rounded-full
                bg-[#5eeaf0]
                shadow-[0_0_8px_#5eeaf0]
                [animation:hero-blink_1.8s_ease-in-out_infinite]
              "
            />

            {eyebrow}
          </span>

          {/* Title */}

          <h1
            className="
              order-2
              text-[clamp(32px,5.5vw,64px)]
              leading-[1.05]
              font-semibold
              text-[#e9eef2]
              max-w-[16ch]
              mb-[18px]
              tracking-[-0.01em]
            "
          >
            {title}
          </h1>

          {/* Subtitle */}

          <p
            className="
              order-3
              font-sans
              text-base
              font-normal
              leading-relaxed
              text-[#96a3ad]
              mb-8
            "
          >
            {subtitle}
          </p>

          {/* ====================================================
              JOIN US BUTTON
              ==================================================== */}

          <button
            type="button"
            onClick={onCtaClick}
            className="
              order-5
              w-fit
              px-[22px]
              py-3
              text-sm
              font-semibold
              text-[#e9eef2]
              bg-white/[0.03]
              border
              border-[rgba(94,234,240,0.32)]
              rounded-md
              cursor-pointer
              transition-[border-color,background-color,transform]
              duration-200

              hover:border-[rgba(94,234,240,0.75)]
              hover:bg-[rgba(94,234,240,0.06)]
              hover:-translate-y-px

              focus-visible:outline
              focus-visible:outline-2
              focus-visible:outline-[#5eeaf0]
              focus-visible:outline-offset-[3px]
            "
          >
            {ctaLabel}
          </button>

          {/* Meta */}

          <span
            className="
              order-4
              self-start
              text-left
              mt-7
              mb-4
              font-[ui-monospace,_'JetBrains_Mono',_monospace]
              text-xs
              text-[#55636d]
            "
          >
            {meta}
          </span>

        </div>

        {/* ======================================================
            RIGHT SIDE — THREE.JS ROBOT
        ====================================================== */}

        <div
          className="
            relative
            flex
            items-center
            justify-center
            w-[min(80%,420px)]
            max-lg:max-w-[360px]
            max-[768px]:max-w-[280px]
            aspect-square
            mx-auto
            overflow-hidden
            rounded-[5%]
          "
        >

          {/* Robot glow */}

          <div
            className="
              absolute
              inset-0
              z-[1]
              rounded-[5%]
              bg-[radial-gradient(circle_at_35%_35%,rgba(94,234,240,0.12),rgba(143,216,221,0.04),transparent_20%)]
              backdrop-blur-[2px]
              pointer-events-none
              shadow-[inset_0_0_60px_rgba(94,234,240,0.05)]
            "
          />

          {/* Three.js Canvas Mount */}

          <div
            id="robot-canvas-mount"
            ref={containerRef}
            className="
              absolute
              inset-0
              w-full
              h-full
              z-[2]
            "
          />

        </div>

      </section>
    </div>
  );
}