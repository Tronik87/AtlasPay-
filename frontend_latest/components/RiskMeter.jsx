export default function RiskMeter({ score }) {
  const percentage = Math.round(score * 100);
  const tone =
    score > 0.7 ? "linear-gradient(90deg, #f59e0b, #ef4444)" : "linear-gradient(90deg, #34d399, #35c8ff)";
  const label = score > 0.7 ? "Elevated exposure" : "Contained exposure";

  return (
    <div className="glass-panel interactive-card">
      <div className="panel-content">
        <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "center" }}>
          <div>
            <p className="eyebrow">Risk Posture</p>
            <h2 className="section-title" style={{ marginTop: "18px", fontSize: "1.7rem" }}>
              Real-time confidence envelope
            </h2>
            <p className="section-copy">
              A compact visual readout for how safely the current routing posture sits
              inside AtlasPay operational thresholds.
            </p>
          </div>
          <span className={`status-pill${score > 0.7 ? " warning" : ""}`}>{label}</span>
        </div>

        <div style={{ marginTop: "28px" }}>
          <div
            style={{
              height: "18px",
              borderRadius: "999px",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(148, 163, 184, 0.12)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: "100%",
                borderRadius: "999px",
                background: tone,
                boxShadow: "0 0 26px rgba(53, 200, 255, 0.28)",
                transition: "width 360ms ease",
              }}
            />
          </div>

          <div className="stats-list" style={{ marginTop: "18px" }}>
            <div className="stat-tile">
              <span className="stat-tile-label">Risk Score</span>
              <strong className="stat-tile-value">{score}</strong>
            </div>
            <div className="stat-tile">
              <span className="stat-tile-label">Exposure</span>
              <strong className="stat-tile-value">{percentage}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
