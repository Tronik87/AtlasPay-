function formatNode(node) {
  if (Array.isArray(node)) {
    return node.filter(Boolean).map(formatNodeLabel).join(" • ");
  }

  return formatNodeLabel(node);
}

function formatNodeLabel(value) {
  return String(value).replace(/([a-z])([A-Z])/g, "$1 $2");
}

export default function RouteVisualizer({ data }) {
  return (
    <div className="fade-slide">
      <div className="route-path">
        {data.path.map((node, index) => (
          <div key={`${formatNode(node)}-${index}`} style={{ display: "contents" }}>
            <div className="route-node">{formatNode(node)}</div>
            {index < data.path.length - 1 ? (
              <span className="route-arrow" aria-hidden="true">
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="subtle-divider" style={{ margin: "24px 0" }} />

      <div className="stats-list">
        <div className="stat-tile">
          <span className="stat-tile-label">Total Cost</span>
          <strong className="stat-tile-value glow">$ {data.summary.total_cost}</strong>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-label">Fees</span>
          <strong className="stat-tile-value">{data.summary.total_fee}</strong>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-label">FX Loss</span>
          <strong className="stat-tile-value">{data.summary.total_fx_loss}</strong>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-label">Settlement Time</span>
          <strong className="stat-tile-value">{data.summary.total_time} s</strong>
        </div>
      </div>
    </div>
  );
}
