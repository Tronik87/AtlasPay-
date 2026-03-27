import { useState } from "react";
import Navbar from "../components/Navbar";
import RouteVisualizer from "../components/RouteVisualizer";

export default function Simulate() {
  const [result, setResult] = useState(null);

  const handleSimulate = () => {
    setResult({
      path: ["BankA", "BankC", "BankD"],
      summary: {
        total_cost: 12,
        total_fee: 8,
        total_fx_loss: 3,
        total_time: 2
      }
    });
  };

  return (
    <div>
      <Navbar />

      <div style={{ padding: "40px" }}>
        <h1 className="glow" style={{ fontSize: "28px", marginBottom: "20px" }}>
          Payment Control Panel
        </h1>

        <div style={{
          display: "grid",
          gridTemplateColumns: "400px 1fr",
          gap: "30px"
        }}>

          {/* LEFT PANEL */}
          <div className="card">
            <h3 style={{ marginBottom: "15px" }}>Transaction Input</h3>

            <input className="input" placeholder="Sender Bank" />
            <input className="input" placeholder="Receiver Bank" />
            <input className="input" placeholder="Amount" />

            <button className="button" onClick={handleSimulate}>
              Execute Routing
            </button>
          </div>

          {/* RIGHT PANEL */}
          <div className="card">
            <h3 style={{ marginBottom: "15px" }}>Live Routing Output</h3>

            {result ? (
              <RouteVisualizer data={result} />
            ) : (
              <p style={{ opacity: 0.6 }}>
                Awaiting simulation...
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}