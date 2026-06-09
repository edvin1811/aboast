import { ImageResponse } from "next/og";

export const runtime = "edge";

const BRAND_RED = "#ff595e";
const BRAND_RED_DARK = "#ec4046";
const CARD_DARK = "#0f0f0f";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "aboast").slice(0, 140);
  const tag = (searchParams.get("tag") ?? "BLOG").slice(0, 24).toUpperCase();

  const titleFont = title.length > 90 ? 48 : title.length > 60 ? 60 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 56,
          background: `linear-gradient(135deg, ${BRAND_RED} 0%, ${BRAND_RED_DARK} 100%)`,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative scatter — quote glyph top-right */}
        <div
          style={{
            position: "absolute",
            top: 36,
            right: 48,
            display: "flex",
            opacity: 0.18,
            fontSize: 180,
            color: "white",
            fontFamily: "serif",
            lineHeight: 1,
            fontWeight: 700,
          }}
        >
          "
        </div>

        {/* Decorative scatter — sparkles bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 64,
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <Star size={28} color="white" opacity={0.6} />
          <Star size={20} color="white" opacity={0.4} />
          <Star size={14} color="white" opacity={0.3} />
        </div>

        {/* Decorative scatter — dots bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 64,
            display: "flex",
            gap: 10,
          }}
        >
          <Dot opacity={0.85} />
          <Dot opacity={0.55} />
          <Dot opacity={0.3} />
        </div>

        {/* Brand bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Logomark />
          <div
            style={{
              color: "white",
              fontSize: 30,
              fontWeight: 800,
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
            borderRadius: 28,
            padding: "56px 64px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              color: BRAND_RED,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: 4,
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                width: 28,
                height: 3,
                background: BRAND_RED,
                borderRadius: 2,
                display: "block",
              }}
            />
            {tag}
          </div>
          <div
            style={{
              color: CARD_DARK,
              fontSize: titleFont,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1.2,
              marginTop: 24,
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

/* ---------- Inline SVG decorations ---------- */

function Logomark() {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 20px -6px rgba(0,0,0,0.25)",
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 18c0-3.2 2.3-6 5.5-6h1c2 0 3.7 1.4 3.7 3.2v.3c0 1.7-1.4 3-3 3H8M14 6c2.6 0 4.8 1.6 5.5 4l.5 2.5c.2 1 .9 1.8 1.7 2L21 16"
          stroke={BRAND_RED}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function Star({
  size,
  color,
  opacity,
}: {
  size: number;
  color: string;
  opacity: number;
}) {
  return (
    <div style={{ display: "flex", opacity }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2l2.5 6.5L21 9.5l-5 4.5 1.5 7L12 17l-5.5 4 1.5-7-5-4.5 6.5-1L12 2z" />
      </svg>
    </div>
  );
}

function Dot({ opacity }: { opacity: number }) {
  return (
    <div
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: "white",
        opacity,
      }}
    />
  );
}
