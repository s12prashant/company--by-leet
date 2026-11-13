import { getSiteIndex } from "@/lib/data";

/** Static JSON with every company summary + every unique question. Prerendered at build time. */
export function GET() {
  return Response.json(getSiteIndex());
}
