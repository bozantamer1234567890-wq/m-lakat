import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const scale = 180 / 40;
  const bar = (x: number, y: number, w: number, h: number, color: string) => (
    <div
      style={{
        position: "absolute",
        left: x * scale,
        top: y * scale,
        width: w * scale,
        height: h * scale,
        borderRadius: 2 * scale,
        background: color,
      }}
    />
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#111315",
          borderRadius: 9 * scale,
          position: "relative",
          display: "flex",
        }}
      >
        {bar(6, 23, 7, 12, "#F7F5F0")}
        {bar(16.5, 15, 7, 20, "#F7F5F0")}
        {bar(27, 6, 7, 29, "#0F766E")}
      </div>
    ),
    { ...size }
  );
}
