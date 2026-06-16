import { ImageResponse } from "next/og";
import { CONFIG } from "@/lib/app-config";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ username: string }> };

export default async function ShareOpenGraphImage({ params }: Props) {
  const { username } = await params;
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
        width={120}
        height={120}
        alt=""
        style={{ borderRadius: 24, marginBottom: 24 }}
      />
      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "#f8fafc",
          letterSpacing: "-0.02em",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        @{username}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 600,
          color: "#94a3b8",
          marginTop: 12,
          textAlign: "center",
        }}
      >
        Panini WC 2026 collection
      </div>
      <div
        style={{
          fontSize: 20,
          color: "#64748b",
          marginTop: 18,
          textAlign: "center",
          maxWidth: 720,
        }}
      >
        Missing stickers & duplicates for swapping
      </div>
    </div>,
    { ...size }
  );
}
