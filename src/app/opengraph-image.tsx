import { ImageResponse } from "next/og";
import { getGlobalStats } from "@/lib/data";

/** Link-preview card (WhatsApp, LinkedIn, X, Slack...) for every page without its own image. */
export const alt = "CompanyLeet: solve LeetCode questions company-wise";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = "#F26B1D";

export default function OpengraphImage() {
  const stats = getGlobalStats();
  const pills = [
    `${stats.companies}+ companies`,
    `${stats.total.toLocaleString("en-US")} questions`,
    "Streaks & heatmap",
    "Bookmarks & notes",
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0B0B0C",
          color: "#FAFAFA",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: BRAND,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 16 4-4-4-4" />
              <path d="m6 8-4 4 4 4" />
              <path d="m14.5 4-5 16" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700 }}>
            <span>Company</span>
            <span style={{ color: BRAND }}>Leet</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            Solve LeetCode questions company-wise
          </div>
          <div style={{ fontSize: 32, color: "#A1A1AA" }}>
            Practise the exact questions Google, Amazon, Meta & more ask in interviews.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {pills.map((p) => (
            <div
              key={p}
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
                whiteSpace: "nowrap",
                fontSize: 24,
                height: 60,
                padding: "0 22px",
                borderRadius: 999,
                border: "2px solid #27272A",
                background: "#18181B",
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
