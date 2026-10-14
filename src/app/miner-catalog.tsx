"use client";

import { useEffect, useMemo, useState } from "react";

type Miner = {
  id: string;
  name: string;
  slug: string | null;
  activationStatus: string | null;
  supportedIntents: string[];
  minPriceUsdc: number | null;
  endpoints: unknown[];
};

type Payload = {
  miners: Miner[];
  fetchedAt: string | null;
  source: "live" | "fallback";
  error?: string;
};

export default function MinerCatalog() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/miners", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load miner discovery");
        return response.json() as Promise<Payload>;
      })
      .then((data) => { if (active) setPayload(data); })
      .catch((error: unknown) => {
        if (active) setPayload({
          miners: [],
          fetchedAt: null,
          source: "fallback",
          error: error instanceof Error ? error.message : "Miner discovery unavailable"
        });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const miners = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (payload?.miners ?? []).filter((miner) =>
      !needle || [miner.id, miner.name, miner.slug ?? "", miner.activationStatus ?? "", ...miner.supportedIntents]
        .join(" ").toLowerCase().includes(needle)
    );
  }, [payload, query]);

  const activeCount = (payload?.miners ?? []).filter((miner) =>
    (miner.activationStatus ?? "").toLowerCase() === "active"
  ).length;
  const intentCount = new Set((payload?.miners ?? []).flatMap((miner) => miner.supportedIntents)).size;

  return (
    <section className="section catalog-section" aria-labelledby="miner-catalog-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">NETWORK DISCOVERY</p>
          <h2 id="miner-catalog-title">Registered Telegraph miners</h2>
          <p className="catalog-intro">Live miner metadata is read from Telegraph discovery. Registration alone does not guarantee a miner is healthy or suitable; endpoint schemas must be validated before execution.</p>
        </div>
        <span className={`pill ${payload?.source === "live" ? "pill-live" : ""}`}>
          {loading ? "SYNCING…" : payload?.source === "live" ? "LIVE DISCOVERY" : "DISCOVERY OFFLINE"}
        </span>
      </div>

      <div className="catalog-toolbar">
        <label className="catalog-search">
          <span className="sr-only">Search miners</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search miners, intents, or status…" />
        </label>
      </div>

      <div className="catalog-count">
        <strong>{miners.length.toLocaleString()}</strong> matching miners
        <span>{payload?.source === "live" ? `${payload.miners.length} registered` : "Live miner list unavailable"}</span>
        <span>{payload?.source === "live" ? `${activeCount} marked active · ${intentCount} declared intents` : "No availability assumed"}</span>
      </div>

      {payload?.source !== "live" && !loading && (
        <p className="catalog-warning" role="status">
          Live miner discovery could not be confirmed. SentinelX must not infer availability or attempt paid requests from this state. {payload?.error ? `Detail: ${payload.error}` : ""}
        </p>
      )}

      <div className="catalog-list">
        {miners.map((miner) => (
          <article className="catalog-item" key={miner.id}>
            <div className="catalog-item-main">
              <code>{miner.name} · ID {miner.id}</code>
              <p>{miner.slug ?? "No slug supplied"} · {miner.supportedIntents.length} declared intents · {miner.endpoints.length} declared endpoints</p>
              <p>{miner.supportedIntents.length ? miner.supportedIntents.join(", ") : "No supported intents declared"}</p>
            </div>
            <div className="catalog-item-meta">
              <span className={`tag ${(miner.activationStatus ?? "").toLowerCase() === "active" ? "tag-canonical" : "tag-proposed"}`}>
                {(miner.activationStatus ?? "STATUS UNKNOWN").toUpperCase()}
              </span>
              <span className="miner-count">{miner.minPriceUsdc === null ? "Price not declared" : `Min $ ${miner.minPriceUsdc} USDC`}</span>
            </div>
          </article>
        ))}
        {!loading && miners.length === 0 && (
          <p className="empty-state">{payload?.source === "live" ? "No miners match this search." : "No verified live miner records are available."}</p>
        )}
      </div>
      <p className="catalog-footnote">
        {payload?.fetchedAt ? `Retrieved ${new Date(payload.fetchedAt).toLocaleString()} · ` : ""}
        Displayed metadata is provider-reported. Active status, endpoint compatibility, pricing challenge, and payment authorization must be rechecked before any paid request.
      </p>
    </section>
  );
}
