import GlobalBackground from "../components/GlobalBackground";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";

export default function Logs() {
  const [transactions, setTransactions] = useState([]);

  // -------------------------------
  // Fetch transactions
  // -------------------------------
useEffect(() => {
  fetch("http://127.0.0.1:8000/transactions") // ✅ FIXED endpoint
    .then(res => res.json())
    .then(data => {
      console.log("API DATA:", data); // ✅ correct place

      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      } else {
        setTransactions([]);
      }
    })
    .catch(err => console.error("Error fetching transactions:", err));
}, []);

  // -------------------------------
  // Derived metrics
  // -------------------------------
  const avgCost =
    transactions.length > 0
      ? (
          transactions.reduce((sum, t) => sum + t.cost, 0) /
          transactions.length
        ).toFixed(2)
      : 0;

  const lowestRoute =
    transactions.length > 0
      ? transactions.reduce((min, t) =>
          t.cost < min.cost ? t : min
        ).route
      : "-";

const highRiskCount = Array.isArray(transactions)
  ? transactions.filter(t => t.risk === "HIGH").length
  : 0;

  return (
    <div className="app-shell">
      <GlobalBackground />
      <Navbar />

      <main className="app-main page-content-layer">
        {/* ---------------- HERO ---------------- */}
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
                {transactions.length}
              </div>
              <p className="metric-foot">
                Concise reporting for payment operators reviewing corridor decisions.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- METRICS ---------------- */}
        <section className="metric-grid" style={{ marginBottom: "24px" }}>
          <div className="metric-card span-4 interactive-card">
            <p className="metric-label">Average Logged Cost</p>
            <div className="metric-value">${avgCost}</div>
            <p className="metric-foot">Derived from the current transaction log entries.</p>
          </div>

          <div className="metric-card span-4 interactive-card">
            <p className="metric-label">Lowest Cost Route</p>
            <div className="metric-value" style={{ fontSize: "1.6rem" }}>
              {lowestRoute}
            </div>
            <p className="metric-foot">The most efficient logged path in this visible data slice.</p>
          </div>

          <div className="metric-card span-4 interactive-card">
            <p className="metric-label">High Risk Entries</p>
            <div className="metric-value" style={{ color: "#fb7185" }}>
              {highRiskCount}
            </div>
            <p className="metric-foot">Routes currently in elevated risk category.</p>
          </div>
        </section>

        {/* ---------------- TABLE ---------------- */}
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
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", opacity: 0.6 }}>
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>#{tx.id}</td>
                        <td>{tx.route}</td>
                        <td>${Number(tx.cost).toFixed(2)}</td>
                        <td>
                          <span
                            className={`badge ${
                              tx.risk === "HIGH" ? "badge-high" : "badge-low"
                            }`}
                          >
                            {tx.risk}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}