import { NextResponse } from "next/server";
import { getIntentCatalog } from "@/lib/telegraph/catalog";
import { getMinerCatalog } from "@/lib/telegraph/miners";
import { buildGenericExecutionPlan } from "@/lib/telegraph/planner";

export const dynamic = "force-dynamic";

/**
 * Read-only planning endpoint. This route never calls paid Telegraph ask APIs
 * and never signs or submits a payment.
 */
export async function GET() {
  const [intents, miners] = await Promise.all([getIntentCatalog(), getMinerCatalog()]);
  const plan = buildGenericExecutionPlan(intents, miners);
  return NextResponse.json(plan, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    },
    status: 200
  });
}
