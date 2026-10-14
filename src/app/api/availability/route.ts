import { NextResponse } from "next/server";
import { getIntentCatalog } from "@/lib/telegraph/catalog";
import { buildIntentAvailabilityCatalog } from "@/lib/telegraph/availability";
import { getMinerCatalog } from "@/lib/telegraph/miners";

export const dynamic = "force-dynamic";

export async function GET() {
  const [intents, miners] = await Promise.all([getIntentCatalog(), getMinerCatalog()]);
  const catalog = buildIntentAvailabilityCatalog(intents, miners);
  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    },
    status: 200
  });
}
