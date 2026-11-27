import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "radial-gradient(circle at 80% 20%, #0055BF 0%, transparent 45%), radial-gradient(circle at 10% 90%, #E3000B 0%, transparent 45%), #0A0A0F",
          color: "white",
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ width: 64, height: 40, background: "#E3000B", borderRadius: 8 }} />
          <div style={{ width: 40, height: 40, background: "#FFD500", borderRadius: 8 }} />
          <div style={{ width: 40, height: 40, background: "#0055BF", borderRadius: 8 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: -4 }}>{siteConfig.name}</div>
          <div style={{ fontSize: 44, opacity: 0.8 }}>Catalog gạch xếp hình chọn lọc</div>
        </div>
      </div>
    ),
    size,
  );
}
