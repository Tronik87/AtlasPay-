const corridors = [
  { from: "New York", to: "London", rail: "SWIFT", utilization: "84%" },
  { from: "London", to: "Frankfurt", rail: "SEPA", utilization: "91%" },
  { from: "Singapore", to: "Mumbai", rail: "RTGS", utilization: "77%" },
  { from: "Dubai", to: "Singapore", rail: "SWIFT", utilization: "68%" },
];

const networkNodes = [
  { label: "New York", top: 18, left: 14 },
  { label: "London", top: 31, left: 39 },
  { label: "Frankfurt", top: 46, left: 49 },
  { label: "Dubai", top: 64, left: 66 },
  { label: "Singapore", top: 76, left: 82 },
  { label: "Mumbai", top: 59, left: 79 },
];

const networkLinks = [
  { x1: 16, y1: 24, x2: 37, y2: 30 },
  { x1: 41, y1: 35, x2: 48, y2: 44 },
  { x1: 57, y1: 57, x2: 65, y2: 63 },
  { x1: 70, y1: 67, x2: 78, y2: 59 },
  { x1: 72, y1: 70, x2: 79, y2: 74 },
];

export default function GraphView() {
  return (
    <div className="grid-two">
      <div className="glass-panel interactive-card">
        <div className="panel-content">
          <div className="hero-copy" style={{ maxWidth: "100%" }}>
            <p className="eyebrow">Network Topology</p>
            <h2 className="section-title" style={{ marginTop: "18px", fontSize: "1.55rem" }}>
              Global corridor visibility
            </h2>
            <p className="section-copy">
              AtlasPay prioritizes high-liquidity rails across major treasury hubs while
              keeping the interface focused on operator clarity.
            </p>
          </div>

          <div
            style={{
              marginTop: "28px",
              minHeight: "300px",
              borderRadius: "26px",
              border: "1px solid rgba(148, 163, 184, 0.12)",
              background:
                "radial-gradient(circle at 20% 20%, rgba(53, 200, 255, 0.18), transparent 20%), radial-gradient(circle at 80% 28%, rgba(139, 92, 246, 0.16), transparent 22%), radial-gradient(circle at 65% 78%, rgba(52, 211, 153, 0.16), transparent 20%), rgba(2, 6, 23, 0.52)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
            >
              <defs>
                <linearGradient id="networkLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(34,211,238,0.95)" />
                  <stop offset="55%" stopColor="rgba(53,200,255,0.75)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0.38)" />
                </linearGradient>
              </defs>

              {networkLinks.map((link, index) => (
                <g key={`${link.x1}-${link.y1}-${index}`}>
                  <line
                    x1={link.x1}
                    y1={link.y1}
                    x2={link.x2}
                    y2={link.y2}
                    stroke="rgba(34,211,238,0.16)"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                  <line
                    x1={link.x1}
                    y1={link.y1}
                    x2={link.x2}
                    y2={link.y2}
                    stroke="url(#networkLineGradient)"
                    strokeWidth="0.65"
                    strokeLinecap="round"
                  />
                </g>
              ))}
            </svg>

            {networkNodes.map((node) => (
              <div
                key={node.label}
                style={{
                  position: "absolute",
                  top: `${node.top}%`,
                  left: `${node.left}%`,
                  transform: "translate(-50%, -50%)",
                  padding: "10px 14px",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(135deg, rgba(53, 200, 255, 0.18), rgba(139, 92, 246, 0.18))",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: "0 12px 32px rgba(2, 6, 23, 0.3), 0 0 18px rgba(53, 200, 255, 0.08)",
                  fontWeight: 600,
                  zIndex: 2,
                }}
              >
                {node.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel interactive-card">
        <div className="panel-content">
          <p className="eyebrow">Corridor Health</p>
          <h2 className="section-title" style={{ marginTop: "18px", fontSize: "1.55rem" }}>
            Live operational posture
          </h2>
          <p className="section-copy">
            These values are presented as a static operator view, aligned to the
            existing route monitoring experience.
          </p>

          <div style={{ marginTop: "24px", display: "grid", gap: "14px" }}>
            {corridors.map((corridor) => (
              <div key={`${corridor.from}-${corridor.to}`} className="option-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <div>
                    <div className="metric-label">{corridor.rail}</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "8px" }}>
                      {corridor.from} → {corridor.to}
                    </div>
                  </div>
                  <span className="status-pill">Optimal</span>
                </div>

                <div className="option-meta">
                  <div>
                    <span>Utilization</span>
                    <strong>{corridor.utilization}</strong>
                  </div>
                  <div>
                    <span>Reliability</span>
                    <strong>99.97%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
