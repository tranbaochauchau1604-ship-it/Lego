"use client";

import { RoundedBox } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";

/** Kích thước chuẩn hoá: 1 núm = 1 đơn vị. Brick tự dựng bằng hộp bo góc + các trụ tròn. */
export const STUD = 1;
const BRICK_H = 1.2;
const STUD_R = 0.3;
const STUD_H = 0.22;

type BrickProps = ThreeElements["group"] & {
  cols?: number;
  rows?: number;
  color?: string;
  segments?: number;
  /** Vật liệu nhẹ (mobile): meshStandardMaterial thay vì physical + clearcoat */
  lite?: boolean;
};

export function Brick({ cols = 4, rows = 2, color = "#E3000B", segments = 24, lite = false, ...props }: BrickProps) {
  const w = cols * STUD;
  const d = rows * STUD;
  const studs = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let x = 0; x < cols; x++)
      for (let z = 0; z < rows; z++) out.push([x - (cols - 1) / 2, BRICK_H / 2 + STUD_H / 2, z - (rows - 1) / 2]);
    return out;
  }, [cols, rows]);

  return (
    <group {...props}>
      <RoundedBox args={[w - 0.02, BRICK_H, d - 0.02]} radius={0.06} smoothness={3} castShadow receiveShadow>
        {lite ? <meshStandardMaterial color={color} roughness={0.3} /> : <meshPhysicalMaterial color={color} roughness={0.28} clearcoat={0.6} clearcoatRoughness={0.25} />}
      </RoundedBox>
      {studs.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <cylinderGeometry args={[STUD_R, STUD_R, STUD_H, segments]} />
          {lite ? <meshStandardMaterial color={color} roughness={0.3} /> : <meshPhysicalMaterial color={color} roughness={0.28} clearcoat={0.6} clearcoatRoughness={0.25} />}
        </mesh>
      ))}
    </group>
  );
}
