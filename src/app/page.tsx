import { EXCHANGE_INTENTS } from "@/lib/telegraph/intents";
import IntentCatalog from "./intent-catalog";

export default function Home() {
  return (
    <main className="shell">
      <nav className="topbar">
        <a className="brand" href="/" aria-label="SentinelX home">
          <span className="brand-mark">S</span>
          <span>SENTINEL<span className="muted">X</span></span>
        </a>
        <div className="nav-meta">
          <span className="status-dot" />
          TELEGRAPH SEASON II
        </div>
      </nav>

      <section className="hero">
        <p className="eyebrow">AUTONOMOUS LISTING INTELLIGENCE / MISSION 01</p>
        <h1>Know the risk.<br /><span>Prove the decision.</span></h1>
        <p className="intro">
          SentinelX is being built to purchase ranked intelligence through Telegraph
          and turn the evidence into an auditable token-listing risk memo. Its capability
          registry follows Telegraph&apos;s canonical catalogue and keeps future requests
          separate until they are officially registered.
        </p>
        <div className="notice" role="status">
          <strong>Preparation build</strong>
          <span>Live catalogue discovery is being integrated. Paid routing, settlement and live risk results are not connected yet.</span>
        </div>
      </section>

      <section className="metrics" aria-label="Project status">
        <article className="metric">
          <span className="metric-label">MISSION</span>
          <strong>Exchange</strong>
          <span className="metric-note">Apps &amp; Agents</span>
        </article>
        <article className="metric">
          <span className="metric-label">MISSION WORKFLOW</span>
          <strong>{EXCHANGE_INTENTS.length.toString().padStart(2, "0")}</strong>
          <span className="metric-note">Initial workflow building blocks</span>
        </article>
        <article className="metric">
          <span className="metric-label">SETTLED REQUESTS</span>
          <strong>—</strong>
          <span className="metric-note">Not connected</span>
        </article>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EXCHANGE MISSION</p>
            <h2>Evidence we intend to assemble</h2>
          </div>
          <span className="pill">PLANNED · NOT LIVE</span>
        </div>
        <div className="intent-grid">
          {EXCHANGE_INTENTS.map((intent, index) => (
            <article className="intent-card" key={intent.id}>
              <div className="intent-top">
                <span className="intent-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="intent-state">WORKFLOW MODULE</span>
              </div>
              <h3>{intent.label}</h3>
              <p>{intent.purpose}</p>
              <code>{intent.id}</code>
            </article>
          ))}
        </div>
      </section>

      <IntentCatalog />

      <section className="section workflow-section">
        <p className="eyebrow">THE PROMISE</p>
        <h2>Every conclusion must have a receipt.</h2>
        <div className="workflow">
          <div><span>01</span><strong>Discover</strong><p>Load canonical intents and check which miners currently serve them.</p></div>
          <div><span>02</span><strong>Purchase</strong><p>Route paid requests only after checking coverage and spending limits.</p></div>
          <div><span>03</span><strong>Verify</strong><p>Validate answers, receipts, costs and transaction hashes.</p></div>
          <div><span>04</span><strong>Decide</strong><p>Produce an evidence-backed memo with explicit uncertainty.</p></div>
        </div>
      </section>

      <footer>
        <span>SentinelX · Early development</span>
        <span>Testnet boundary: no live purchases yet</span>
      </footer>
    </main>
  );
}
