import { NextResponse } from "next/server";
import { getMinerCatalog } from "@/lib/telegraph/miners";

export const dynamic = "force-dynamic";

export async function GET() {
  const catalog = await getMinerCatalog();
  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    },
    status: 200
  });
}
