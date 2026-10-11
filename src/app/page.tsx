import { EXCHANGE_INTENTS } from "@/lib/telegraph/intents";

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
          and turn the evidence into an auditable token-listing risk memo.
        </p>
        <div className="notice" role="status">
          <strong>Preparation build</strong>
          <span>Live Telegraph routing and settlement are not connected yet. No live risk result or transaction is claimed.</span>
        </div>
      </section>

      <section className="metrics" aria-label="Project status">
        <article className="metric">
          <span className="metric-label">MISSION</span>
          <strong>Exchange</strong>
          <span className="metric-note">Apps &amp; Agents</span>
        </article>
        <article className="metric">
          <span className="metric-label">INTENTS MAPPED</span>
          <strong>{EXCHANGE_INTENTS.length.toString().padStart(2, "0")}</strong>
          <span className="metric-note">Planned request types</span>
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
            <p className="eyebrow">INTELLIGENCE PIPELINE</p>
            <h2>Evidence we intend to buy</h2>
          </div>
          <span className="pill">PLANNED · NOT LIVE</span>
        </div>
        <div className="intent-grid">
          {EXCHANGE_INTENTS.map((intent, index) => (
            <article className="intent-card" key={intent.id}>
              <div className="intent-top">
                <span className="intent-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="intent-state">AWAITING INTEGRATION</span>
              </div>
              <h3>{intent.label}</h3>
              <p>{intent.purpose}</p>
              <code>{intent.id}</code>
            </article>
          ))}
        </div>
      </section>

      <section className="section workflow-section">
        <p className="eyebrow">THE PROMISE</p>
        <h2>Every conclusion must have a receipt.</h2>
        <div className="workflow">
          <div><span>01</span><strong>Request</strong><p>Define the asset and the decision to make.</p></div>
          <div><span>02</span><strong>Purchase</strong><p>Route paid requests through Telegraph.</p></div>
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
