"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { MathUtils, type Group } from "three";
import { Brick } from "@/components/3d/brick";

const COLORS = ["#FFD500", "#0055BF", "#E3000B", "#F4F4F6", "#00852B", "#FF7A00"];

/** Random có seed để vị trí brick ổn định giữa các lần render. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tiến độ cuộn của trang: 0 ở đầu trang, 1 khi đã cuộn hết một màn hình. */
function scrollProgress() {
  if (typeof window === "undefined") return 0;
  return Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.5);
}

function HeroBrick({ reduced, mobile }: { reduced: boolean; mobile: boolean }) {
  const outer = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const prevS = useRef(0);
  const { viewport } = useThree();
  // Mobile: brick nằm ở khoảng trống phía trên tiêu đề; desktop: bên phải
  const x = mobile ? viewport.width * 0.12 : Math.min(viewport.width * 0.27, 4.2);
  const y = mobile ? viewport.height * 0.27 : 0.2;
  const scale = mobile ? Math.min(0.5, viewport.width / 8) : Math.min(1, Math.max(0.55, viewport.width / 16));

  useFrame((state, delta) => {
    if (!outer.current || !inner.current) return;
    if (!reduced) inner.current.rotation.y += delta * 0.25;
    // Parallax: nghiêng theo vị trí chuột
    const px = reduced ? 0 : state.pointer.x;
    const py = reduced ? 0 : state.pointer.y;
    // Vuốt/cuộn trang: brick xoay theo chiều vuốt, ngả ra sau và trôi lên (hoạt động cả trên điện thoại)
    const s = reduced ? 0 : scrollProgress();
    inner.current.rotation.y += (s - prevS.current) * 7;
    prevS.current = s;
    outer.current.rotation.x = MathUtils.damp(outer.current.rotation.x, 0.35 - py * 0.35 + s * 0.9, 4, delta);
    outer.current.rotation.z = MathUtils.damp(outer.current.rotation.z, -0.15 + px * 0.25 - s * 0.5, 4, delta);
    outer.current.position.x = MathUtils.damp(outer.current.position.x, x + px * 0.4 - s * 0.6, 3, delta);
    outer.current.position.y = MathUtils.damp(outer.current.position.y, y + py * 0.25 + s * 1.8, 3, delta);
  });

  return (
    <group ref={outer} position={[x, y, 0]} scale={scale}>
      <Float speed={reduced ? 0 : 1.6} rotationIntensity={0.25} floatIntensity={0.6}>
        <group ref={inner}>
          <Brick cols={4} rows={2} color="#E3000B" segments={mobile ? 16 : 32} lite={mobile} />
          <Brick cols={2} rows={2} color="#FFD500" position={[-1, 1.42, 0]} rotation={[0, 0, 0]} segments={mobile ? 16 : 32} lite={mobile} />
        </group>
      </Float>
    </group>
  );
}

function FloatingBricks({ count, reduced, mobile }: { count: number; reduced: boolean; mobile: boolean }) {
  const { viewport } = useThree();
  const items = useMemo(() => {
    const rand = mulberry32(42);
    return Array.from({ length: count }, (_, i) => {
      const sizes: [number, number][] = [[1, 1], [2, 1], [2, 2], [3, 1], [1, 2]];
      const [cols, rows] = sizes[Math.floor(rand() * sizes.length)];
      return {
        key: i,
        cols,
        rows,
        color: COLORS[i % COLORS.length],
        position: [(rand() - 0.5) * 16, (rand() - 0.5) * 9, -2 - rand() * 8] as [number, number, number],
        rotation: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI] as [number, number, number],
        scale: 0.3 + rand() * 0.35,
        speed: 0.8 + rand() * 1.5,
      };
    });
  }, [count]);

  const group = useRef<Group>(null);
  const prevS = useRef(0);
  useFrame((state, delta) => {
    if (!group.current || reduced) return;
    // Các brick nhỏ trôi ngược chiều cuộn với tốc độ khác brick chính → tạo cảm giác chiều sâu
    const s = scrollProgress();
    const ds = s - prevS.current;
    prevS.current = s;
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, state.pointer.x * 0.12, 2, delta) + ds * 2.5;
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, -state.pointer.y * 0.08 + s * 0.5, 2, delta);
    group.current.rotation.z = MathUtils.damp(group.current.rotation.z, s * 0.35, 2, delta);
    group.current.position.y = MathUtils.damp(group.current.position.y, s * 3.2, 3, delta);
  });

  return (
    <group ref={group} scale={Math.min(1, viewport.width / 14)}>
      {items.map((b) => (
        <Float key={b.key} speed={reduced ? 0 : b.speed} rotationIntensity={1.2} floatIntensity={1.5}>
          <Brick cols={b.cols} rows={b.rows} color={b.color} position={b.position} rotation={b.rotation} scale={b.scale} segments={mobile ? 10 : 16} lite={mobile} />
        </Float>
      ))}
    </group>
  );
}

export default function HeroScene({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Dừng render khi hero ra khỏi màn hình để tiết kiệm pin/CPU
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="h-full w-full" aria-hidden>
      <Canvas
        frameloop={visible ? (reduced ? "demand" : "always") : "never"}
        dpr={mobile ? [1, 1.25] : [1, 1.75]}
        shadows={!mobile}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 10], fov: 40 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.6} castShadow={!mobile} shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-6, -2, 4]} intensity={30} color="#0055BF" />
        <pointLight position={[6, 3, 2]} intensity={20} color="#FFD500" />

        <HeroBrick reduced={reduced} mobile={mobile} />
        <FloatingBricks count={mobile ? 5 : 14} reduced={reduced} mobile={mobile} />

        <ContactShadows position={[mobile ? 0 : 3.5, -2.6, 0]} opacity={0.5} scale={14} blur={2.6} far={5} resolution={mobile ? 256 : 512} frames={reduced || mobile ? 1 : Infinity} />

        {/* Environment tự dựng bằng Lightformer — không tải file HDR ngoài */}
        <Environment resolution={mobile ? 64 : 256}>
          <Lightformer form="rect" intensity={2} position={[0, 5, -5]} scale={[10, 5, 1]} color="#ffffff" />
          <Lightformer form="ring" intensity={3} position={[-5, 1, 2]} scale={3} color="#FFD500" />
          <Lightformer form="rect" intensity={2} position={[5, -1, 3]} scale={[4, 6, 1]} color="#4d8eff" />
          <Lightformer form="circle" intensity={1.5} position={[0, -4, 4]} scale={4} color="#E3000B" />
        </Environment>
      </Canvas>
    </div>
  );
}
