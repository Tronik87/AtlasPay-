export default function TransactionCard({ label, value, footnote, glow = "blue" }) {
  const glowClass = glow === "violet" ? "metric-glow-violet" : "metric-glow-blue";

  return (
    <div className={`metric-card interactive-card span-4 ${glowClass}`}>
      <p className="metric-label">{label}</p>
      <div className="metric-value">{value}</div>
      <p className="metric-foot">{footnote}</p>
    </div>
  );
}
