export default function RiskMeter({ score }) {
  return (
    <div className="card">
      <h2>Risk Analysis</h2>

      <div style={{
        marginTop: "10px",
        height: "12px",
        background: "#1e293b",
        borderRadius: "6px"
      }}>
        <div style={{
          width: `${score * 100}%`,
          height: "12px",
          borderRadius: "6px",
          background: score > 0.7 ? "#ef4444" : "#22c55e",
          boxShadow: "0 0 10px currentColor"
        }} />
      </div>

      <p style={{ marginTop: "10px" }}>
        Score: {score}
      </p>
    </div>
  );
}