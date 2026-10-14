"use client";

import { useEffect, useMemo, useState } from "react";

type CatalogIntent = {
  id: string;
  description: string;
  minerCount?: number | null;
  source?: string;
  label?: string;
  category?: string;
  purpose?: string;
  availability?: {
    status: "available" | "unavailable" | "unknown";
    activeMinerIds: string[];
    reportedMinerCount: number | null;
    reason: string | null;
  };
};

type CatalogPayload = {
  canonical: CatalogIntent[];
  proposed: CatalogIntent[];
  fetchedAt: string | null;
  source: "live" | "fallback";
  minerSource?: "live" | "fallback";
  error?: string;
};

export default function IntentCatalog() {
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "canonical" | "proposed">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/availability", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load the intent catalogue");
        return response.json() as Promise<CatalogPayload>;
      })
      .then((data) => { if (active) setCatalog(data); })
      .catch((error: unknown) => {
        if (active) setCatalog({
          canonical: [],
          proposed: [],
          fetchedAt: null,
          source: "fallback",
          minerSource: "fallback",
          error: error instanceof Error ? error.message : "Catalogue unavailable"
        });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const entries = useMemo(() => {
    if (!catalog) return [];
    const canonical = catalog.canonical.map((intent) => ({
      id: intent.id,
      label: intent.id.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
      description: intent.description,
      status: "canonical" as const,
      minerCount: intent.minerCount ?? null,
      availability: intent.availability ?? { status: "unknown" as const, activeMinerIds: [], reportedMinerCount: intent.minerCount ?? null, reason: "Availability has not been checked." }
    }));
    const proposed = catalog.proposed.map((intent) => ({
      id: intent.id,
      label: intent.label ?? intent.id,
      description: intent.purpose ?? intent.description,
      status: "proposed" as const,
      minerCount: null as number | null
    }));
    return [...(scope === "proposed" ? [] : canonical), ...(scope === "canonical" ? [] : proposed)]
      .filter((item) => !query || `${item.id} ${item.label} ${item.description}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [catalog, query, scope]);

  return (
    <section className="section catalog-section" aria-labelledby="catalog-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CAPABILITY REGISTRY</p>
          <h2 id="catalog-title">The full intent universe</h2>
          <p className="catalog-intro">Live canonical intents are loaded from Telegraph. Forward-looking capabilities stay clearly marked as proposals until they become canonical.</p>
        </div>
        <span className={`pill ${catalog?.source === "live" ? "pill-live" : ""}`}>
          {loading ? "SYNCING…" : catalog?.source === "live" ? "LIVE CATALOG" : "CATALOG OFFLINE"}
        </span>
      </div>

      <div className="catalog-toolbar">
        <label className="catalog-search">
          <span className="sr-only">Search intents</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search any intent or capability…" />
        </label>
        <div className="catalog-tabs" role="group" aria-label="Intent type">
          <button className={scope === "all" ? "selected" : ""} onClick={() => setScope("all")}>All</button>
          <button className={scope === "canonical" ? "selected" : ""} onClick={() => setScope("canonical")}>Canonical</button>
          <button className={scope === "proposed" ? "selected" : ""} onClick={() => setScope("proposed")}>Proposed</button>
        </div>
      </div>

      <div className="catalog-count">
        <strong>{entries.length.toLocaleString()}</strong> matching capabilities
        <span>{catalog?.source === "live" ? `${catalog.canonical.length} canonical from Telegraph` : "Canonical list temporarily unavailable"}</span>
        <span>{catalog?.proposed.length ?? 0} roadmap proposals</span>
        <span>{catalog?.minerSource === "live" ? "Miner coverage checked" : "Miner coverage unknown"}</span>
      </div>

      {catalog?.source !== "live" && !loading && (
        <p className="catalog-warning" role="status">
          Live canonical catalogue could not be reached. Proposed capabilities remain visible, but SentinelX will not treat proposals as registered Telegraph intents. {catalog?.error ? `Detail: ${catalog.error}` : ""}
        </p>
      )}

      <div className="catalog-list">
        {entries.map((item) => (
          <article className="catalog-item" key={item.id}>
            <div className="catalog-item-main">
              <code>{item.id}</code>
              <p>{item.description}</p>
            </div>
            <div className="catalog-item-meta">
              <span className={item.status === "canonical" ? "tag tag-canonical" : "tag tag-proposed"}>
                {item.status === "canonical" ? "CANONICAL" : "PROPOSED"}
              </span>
              {item.status === "canonical" && (
                <span className={`tag availability-${item.availability.status}`}>
                  {item.availability.status === "available" ? "MINER AVAILABLE" : item.availability.status === "unavailable" ? "NO ACTIVE MINER" : "AVAILABILITY UNKNOWN"}
                </span>
              )}
              {item.status === "canonical" && item.availability.status === "available" && (
                <span className="miner-count">{item.availability.activeMinerIds.length} eligible miner(s)</span>
              )}
              {item.status === "canonical" && item.availability.status === "unknown" && (
                <span className="miner-count">Live check required</span>
              )}
            </div>
          </article>
        ))}
        {!loading && entries.length === 0 && <p className="empty-state">No matches. Try another search or change the catalogue filter.</p>}
      </div>
      <p className="catalog-footnote">Canonical registration and miner availability are separate. Availability is marked unknown unless both live discovery sources respond successfully. A displayed eligible miner is metadata-based, not a health check or payment authorization. Proposals are not submitted as paid intent IDs.</p>
    </section>
  );
}
