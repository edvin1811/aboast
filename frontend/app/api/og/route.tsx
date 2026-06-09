import { ImageResponse } from "next/og";

export const runtime = "edge";

const BRAND_RED = "#ff595e";
const CARD_DARK = "#1a1a1a";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "aboast").slice(0, 140);
  const tag = (searchParams.get("tag") ?? "ABOAST").slice(0, 24).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: BRAND_RED,
          padding: 60,
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.aboast.com/logo-color.svg"
            alt="aboast"
            width={56}
            height={56}
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <div
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            aboast
          </div>
        </div>

        {/* Headline card */}
        <div
          style={{
            marginTop: 36,
            flex: 1,
            background: "white",
            borderRadius: 32,
            padding: "64px 72px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxShadow: "0 4px 60px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              color: BRAND_RED,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            {tag}
          </div>
          <div
            style={{
              color: CARD_DARK,
              fontSize: title.length > 80 ? 52 : 64,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -1,
              marginTop: 28,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
