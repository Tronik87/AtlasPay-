import GlobalBackground from "../components/GlobalBackground";
import Navbar from "../components/Navbar";

export default function Logs() {
  const logs = [
    { id: 1, route: "A → C → D", cost: 12, risk: "Low" },
    { id: 2, route: "A → B → D", cost: 15, risk: "High" },
  ];

  return (
    <div className="app-shell">
      <GlobalBackground />
      <Navbar />

      <main className="app-main page-content-layer">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Analytics Ledger</span>
            <h1>Review transaction outcomes inside a premium audit-ready surface.</h1>
            <p>
              The same transaction log data is now framed like an executive reporting
              tool, with cleaner spacing, stronger hierarchy, and easier scanning.
            </p>
          </div>

          <div className="hero-aside glass-panel">
            <div className="panel-content">
              <div className="metric-label">Visible Entries</div>
              <div className="metric-value" style={{ fontSize: "2rem" }}>
                {logs.length}
              </div>
              <p className="metric-foot">
                Concise reporting for payment operators reviewing corridor decisions.
              </p>
            </div>
          </div>
        </section>

        <section className="metric-grid" style={{ marginBottom: "24px" }}>
          <div className="metric-card span-4 interactive-card">
            <p className="metric-label">Average Logged Cost</p>
            <div className="metric-value">$13.5</div>
            <p className="metric-foot">Derived from the current transaction log entries.</p>
          </div>
          <div className="metric-card span-4 interactive-card">
            <p className="metric-label">Lowest Cost Route</p>
            <div className="metric-value" style={{ fontSize: "2rem" }}>
              A → C → D
            </div>
            <p className="metric-foot">The most efficient logged path in this visible data slice.</p>
          </div>
          <div className="metric-card span-4 interactive-card">
            <p className="metric-label">High Risk Entries</p>
            <div className="metric-value" style={{ color: "#fb7185" }}>
              1
            </div>
            <p className="metric-foot">A single route currently sits in the elevated risk category.</p>
          </div>
        </section>

        <section className="glass-panel interactive-card">
          <div className="panel-content">
            <span className="eyebrow">Transaction Table</span>
            <h2 className="section-title" style={{ marginTop: "18px", fontSize: "1.6rem" }}>
              Execution history
            </h2>
            <p className="section-copy">
              Operator-friendly transaction history with clearer spacing and richer visual hierarchy.
            </p>

            <div className="table-shell" style={{ marginTop: "26px" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Route</th>
                    <th>Cost</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>#{log.id}</td>
                      <td>{log.route}</td>
                      <td>${log.cost}</td>
                      <td>
                        <span className={`badge ${log.risk === "Low" ? "badge-low" : "badge-high"}`}>
                          {log.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
