import { NextResponse } from "next/server";
import { getIntentCatalog } from "@/lib/telegraph/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const catalog = await getIntentCatalog();
  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    },
    status: 200
  });
}
