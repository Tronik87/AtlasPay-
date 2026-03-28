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
  marginTop: "20px",
  flex: 1,
  minHeight: "380px",
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
  const [mode, setMode] = useState("balanced");

  useEffect(() => {
    fetch("http://localhost:8000/banks")
      .then((res) => res.json())
      .then((data) => setBanks(data))
      .catch((err) => console.error("Error fetching banks:", err));
  }, []);

  const handleSimulate = async () => {
    if (!sender || !receiver) {
      alert("Select both banks");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/simulate", {
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

  // Extract routes for selected mode
  const currentRoutes = useMemo(() => {
    return result?.routes_by_mode?.[mode]?.routes ?? [];
  }, [result, mode]);

  const bestRoute = useMemo(() => {
    return currentRoutes.find((r) => r.is_best);
  }, [currentRoutes]);

  const routeCount = currentRoutes.length;
  const summary = bestRoute?.summary;

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
                {mode.toUpperCase()}
              </div>
              <p className="metric-foot">
                Execute deterministic routing with full transparency.
              </p>
            </div>
          </div>
        </section>

        <section className="grid-two">
          {/* INPUT PANEL */}
          <div className="glass-panel interactive-card">
            <div className="panel-content">
              <span className="eyebrow">Input</span>

              <div className="form-grid" style={{ marginTop: "20px" }}>
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

                <select
                  className="glass-select"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="cheapest">Cheapest</option>
                  <option value="fastest">Fastest</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>

              <div style={{ marginTop: "20px" }}>
                <button className="button-primary" onClick={handleSimulate}>
                  Execute Routing
                </button>
              </div>
            </div>
          </div>

          {/* OUTPUT PANEL */}
          <div className="glass-panel interactive-card" style={OUTPUT_PANEL_STYLE}>
            <div className="panel-content" style={{ flex: 1 }}>
              <span className="eyebrow">Output</span>

              {result ? (
                <>
                  <div style={{ marginTop: "10px", opacity: 0.7 }}>
                    Total Routes: {routeCount}
                  </div>

                  {/* ✅ BEST ROUTE SUMMARY */}
                  {bestRoute && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "10px",
                        marginTop: "12px",
                      }}
                    >
                      <div className="glass-panel" style={{ padding: "10px" }}>
                        Final: {summary.final_amount}
                      </div>
                      <div className="glass-panel" style={{ padding: "10px" }}>
                        Cost: {summary.total_cost}
                      </div>
                      <div className="glass-panel" style={{ padding: "10px" }}>
                        Time: {summary.total_time}
                      </div>
                      <div className="glass-panel" style={{ padding: "10px" }}>
                        Fees: {summary.total_fee}
                      </div>
                      <div className="glass-panel" style={{ padding: "10px" }}>
                        FX Loss: {summary.total_fx_loss}
                      </div>
                      <div className="glass-panel" style={{ padding: "10px" }}>
                        Rate: {summary.effective_rate}
                      </div>
                    </div>
                  )}

                  {/* VISUALIZER */}
                  <div style={VISUALIZER_WRAPPER_STYLE}>
                    <RouteVisualizer
                      bestRoute={bestRoute}
                      routes={currentRoutes}
                    />
                  </div>

                  {/* ✅ ALL ROUTES COMPARISON */}
                  <div style={{ marginTop: "12px" }}>
                    {currentRoutes.map((route) => (
                      <div
                        key={route.route_id}
                        style={{
                          marginTop: "8px",
                          padding: "10px",
                          border: route.is_best
                            ? "1px solid #4ade80"
                            : "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                      >
                        <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                          Route {route.route_id}{" "}
                          {route.is_best && "(Best)"}
                        </div>

                        <div style={{ display: "flex", gap: "16px" }}>
                          <span>Cost: {route.summary.total_cost}</span>
                          <span>Time: {route.summary.total_time}</span>
                          <span>Final: {route.summary.final_amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ marginTop: "20px" }}>
                  Enter details and run simulation.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}