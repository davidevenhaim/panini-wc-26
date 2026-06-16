import { ImageResponse } from "next/og";
import { CONFIG } from "@/lib/app-config";

export const runtime = "edge";
export const alt = "Panini WC 2026 Album Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoUrl = new URL("/logo.png", CONFIG.siteUrl).toString();

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0f1e 0%, #0f172a 45%, #134e4a 100%)",
        padding: 48,
      }}
    >
      {}
      <img
        src={logoUrl}
        width={160}
        height={160}
        alt=""
        style={{ borderRadius: 28, marginBottom: 28 }}
      />
      <div
        style={{
          fontSize: 68,
          fontWeight: 800,
          color: "#f8fafc",
          letterSpacing: "-0.02em",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        Panini WC 2026
      </div>
      <div
        style={{
          fontSize: 34,
          fontWeight: 600,
          color: "#94a3b8",
          marginTop: 14,
          textAlign: "center",
        }}
      >
        Album Tracker
      </div>
      <div
        style={{
          fontSize: 22,
          color: "#64748b",
          marginTop: 20,
          textAlign: "center",
          maxWidth: 720,
        }}
      >
        Track stickers, find swaps, share your missing list
      </div>
    </div>,
    { ...size }
  );
}
