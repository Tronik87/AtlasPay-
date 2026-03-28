import { useEffect, useMemo, useState } from "react";
import GlobalBackground from "../components/GlobalBackground";
import Navbar from "../components/Navbar";
import RouteVisualizer from "../components/RouteVisualizer";

const OUTPUT_PANEL_STYLE = {
  minHeight: "560px",
  display: "flex",
  flexDirection: "column",
};

const VISUALIZER_WRAPPER_STYLE = {
  marginTop: "28px",
  flex: 1,
  minHeight: "420px",
  width: "100%",
  overflow: "hidden",
  borderRadius: "12px",
  position: "relative",
};

export default function Simulate() {
  const [result, setResult] = useState(null);
  const [banks, setBanks] = useState([]);
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState(1000);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/banks")
      .then((res) => res.json())
      .then((data) => setBanks(data))
      .catch((err) => console.error("Error fetching banks:", err));
  }, []);

  const routeCount = useMemo(() => result?.total_routes ?? 0, [result]);

  const handleSimulate = async () => {
    if (!sender || !receiver) {
      alert("Select both banks");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sender, receiver, amount, currency }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Backend error");
    }
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
              Preview route quality, projected fees, and settlement timing using
              your payment routing engine.
            </p>
          </div>

          <div className="hero-aside glass-panel">
            <div className="panel-content">
              <div className="metric-label">Simulation Mode</div>
              <div className="metric-value" style={{ fontSize: "2rem" }}>
                Manual
              </div>
              <p className="metric-foot">
                Execute deterministic routing with full transparency.
              </p>
            </div>
          </div>
        </section>

        <section className="grid-two">
          <div className="glass-panel interactive-card">
            <div className="panel-content">
              <span className="eyebrow">Input</span>
              <h2
                className="section-title"
                style={{ marginTop: "18px", fontSize: "1.6rem" }}
              >
                Transaction briefing
              </h2>

              <div className="form-grid" style={{ marginTop: "26px" }}>
                <select
                  className="glass-select"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                >
                  <option value="">Select Sender</option>
                  {banks.map((bank) => (
                    <option key={bank.name} value={bank.name}>
                      {bank.name} ({bank.country})
                    </option>
                  ))}
                </select>

                <select
                  className="glass-select"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                >
                  <option value="">Select Receiver</option>
                  {banks.map((bank) => (
                    <option key={bank.name} value={bank.name}>
                      {bank.name} ({bank.country})
                    </option>
                  ))}
                </select>

                <input
                  className="glass-select"
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />

                <select
                  className="glass-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>

              <div className="subtle-divider" style={{ margin: "24px 0" }} />

              <button className="button-primary" onClick={handleSimulate}>
                Execute Routing
              </button>
            </div>
          </div>

          <div className="glass-panel interactive-card" style={OUTPUT_PANEL_STYLE}>
            <div className="panel-content" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <span className="eyebrow">Output</span>
              <h2
                className="section-title"
                style={{ marginTop: "18px", fontSize: "1.6rem" }}
              >
                Live routing preview
              </h2>

              {result ? (
                <>
                  <div style={{ marginTop: "16px", marginBottom: "6px", opacity: 0.7 }}>
                    Total Routes: {routeCount}
                  </div>
                  <div style={VISUALIZER_WRAPPER_STYLE}>
                    <RouteVisualizer bestRoute={result.best_route} routes={result.routes} />
                  </div>
                </>
              ) : (
                <div className="empty-state" style={{ marginTop: "28px" }}>
                  <h3>Awaiting simulation</h3>
                  <p>Enter payment details and execute routing.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
