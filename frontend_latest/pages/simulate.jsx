import { useState } from "react";
import GlobalBackground from "../components/GlobalBackground";
import Navbar from "../components/Navbar";
import RouteVisualizer from "../components/RouteVisualizer";

export default function Simulate() {
  const [result, setResult] = useState(null);

  const handleSimulate = () => {
    setResult({
      path: ["BankA", "BankC", "BankD"],
      summary: {
        total_cost: 12,
        total_fee: 8,
        total_fx_loss: 3,
        total_time: 2,
      },
    });
  };

  return (
    <div className="app-shell">
      <GlobalBackground />
      <Navbar />

      <main className="app-main page-content-layer">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Payments Studio</span>
            <h1>Simulate cross-border routing with operator-grade clarity.</h1>
            <p>
              Use the existing payment simulation flow to preview route quality,
              projected fees, and settlement timing in a more refined command surface.
            </p>
          </div>

          <div className="hero-aside glass-panel">
            <div className="panel-content">
              <div className="metric-label">Simulation Mode</div>
              <div className="metric-value" style={{ fontSize: "2rem" }}>
                Manual
              </div>
              <p className="metric-foot">
                Execute the current deterministic route preview without altering any business logic.
              </p>
            </div>
          </div>
        </section>

        <section className="grid-two">
          <div className="glass-panel interactive-card">
            <div className="panel-content">
              <span className="eyebrow">Input</span>
              <h2 className="section-title" style={{ marginTop: "18px", fontSize: "1.6rem" }}>
                Transaction briefing
              </h2>
              <p className="section-copy">
                Define the sending and receiving corridor to generate the same
                simulation output you already rely on.
              </p>

              <div className="form-grid" style={{ marginTop: "26px" }}>
                <label className="field">
                  <span className="field-label">Sender Bank</span>
                  <input className="field-control" placeholder="Sender Bank" />
                </label>

                <label className="field">
                  <span className="field-label">Receiver Bank</span>
                  <input className="field-control" placeholder="Receiver Bank" />
                </label>

                <label className="field full">
                  <span className="field-label">Amount</span>
                  <input className="field-control" placeholder="Amount" />
                </label>
              </div>

              <div className="subtle-divider" style={{ margin: "24px 0" }} />

              <button className="button-primary" onClick={handleSimulate}>
                Execute Routing
              </button>
            </div>
          </div>

          <div className="glass-panel interactive-card">
            <div className="panel-content">
              <span className="eyebrow">Output</span>
              <h2 className="section-title" style={{ marginTop: "18px", fontSize: "1.6rem" }}>
                Live routing preview
              </h2>
              <p className="section-copy">
                Settlement results render instantly using the existing response structure.
              </p>

              <div style={{ marginTop: "28px" }}>
                {result ? (
                  <RouteVisualizer data={result} />
                ) : (
                  <div className="empty-state">
                    <h3>Awaiting simulation</h3>
                    <p>
                      Enter payment details and execute routing to reveal the current
                      path and fee summary.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
