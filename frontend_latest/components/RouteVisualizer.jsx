export default function RouteVisualizer({ data }) {
  return (
    <div>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "15px"
      }}>
        {data.path.map((node, i) => (
          <div key={i} style={{
            padding: "10px 16px",
            borderRadius: "10px",
            background: "linear-gradient(135deg,#2563eb,#3b82f6)",
            boxShadow: "0 0 20px rgba(59,130,246,0.6)"
          }}>
            {node}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <p>Total Cost: <span className="glow">${data.summary.total_cost}</span></p>
        <p>Fees: {data.summary.total_fee}</p>
        <p>FX Loss: {data.summary.total_fx_loss}</p>
        <p>Time: {data.summary.total_time}s</p>
      </div>
    </div>
  );
}