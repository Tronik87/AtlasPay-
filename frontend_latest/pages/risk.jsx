import GlobalBackground from "../components/GlobalBackground";
import Navbar from "../components/Navbar";
import RiskMeter from "../components/RiskMeter";

export default function Risk() {
  return (
    <div className="app-shell">
      <GlobalBackground />
      <Navbar />

      <main className="app-main page-content-layer">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Risk Intelligence</span>
            <h1>Monitor treasury exposure with clean, high-signal visual confidence.</h1>
            <p>
              AtlasPay risk views should feel calm and precise, giving operators an
              instant read on whether routing posture remains comfortably controlled.
            </p>
          </div>

          <div className="hero-aside glass-panel">
            <div className="panel-content">
              <div className="metric-label">Assessment Window</div>
              <div className="metric-value" style={{ fontSize: "2rem" }}>
                24h
              </div>
              <p className="metric-foot">
                Current screen summarizes the active routing environment over the latest review cycle.
              </p>
            </div>
          </div>
        </section>

        <section className="grid-two">
          <RiskMeter score={0.65} />

          <div className="glass-panel interactive-card">
            <div className="panel-content">
              <span className="eyebrow">Advisory</span>
              <h2 className="section-title" style={{ marginTop: "18px", fontSize: "1.6rem" }}>
                Current interpretation
              </h2>
              <p className="section-copy">
                The score remains inside a controlled band, suggesting that the present
                mix of routes and treasury signals is operationally acceptable.
              </p>

              <div style={{ marginTop: "26px", display: "grid", gap: "14px" }}>
                <div className="option-card">
                  <div className="metric-label">Primary Outlook</div>
                  <div style={{ marginTop: "10px", fontSize: "1.2rem", fontWeight: 700 }}>
                    Stable routing confidence
                  </div>
                  <p className="metric-foot">
                    No business logic changes have been made; this is a visual upgrade of the same score.
                  </p>
                </div>
                <div className="option-card">
                  <div className="metric-label">Recommended Attention</div>
                  <div style={{ marginTop: "10px", fontSize: "1.2rem", fontWeight: 700 }}>
                    Watch elevated corridors
                  </div>
                  <p className="metric-foot">
                    Keep focus on outlier fee spikes and FX-heavy routes when reviewing treasury posture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
