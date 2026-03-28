import { memo, useCallback, useMemo, useState, useEffect } from "react";
import GlobalBackground from "../components/GlobalBackground";
import Navbar from "../components/Navbar";

const COUNTRY_OPTIONS = [
  "India", "China", "Singapore", "UK", "Germany", "France", "USA", "Canada"
];

const CURRENCY_OPTIONS = ["USD", "INR", "GBP"];
const CRYPTO_OPTIONS = ["auto", "ETH", "BTC", "USDC", "LIGHTNING"];

const optionThemes = {
  ETH: "linear-gradient(135deg, rgba(139, 92, 246, 0.42), rgba(99, 102, 241, 0.16))",
  BTC: "linear-gradient(135deg, rgba(247, 147, 26, 0.42), rgba(251, 191, 36, 0.16))",
  USDC: "linear-gradient(135deg, rgba(37, 99, 235, 0.4), rgba(53, 200, 255, 0.16))",
  LIGHTNING: "linear-gradient(135deg, rgba(250, 204, 21, 0.42), rgba(245, 158, 11, 0.14))",
  BANK_ROUTE: "linear-gradient(135deg, rgba(200, 200, 200, 0.3), rgba(120, 120, 120, 0.1))"
};

export default function CryptoPage() {
  const [form, setForm] = useState({
    sender_country: "USA",
    receiver_country: "India",
    amount: "1000",
    currency: "USD",
    crypto: "auto",
  });

  const [result, setResult] = useState(null);
  const [routes, setRoutes] = useState([]);

  // -------------------------------
  // FETCH FROM BACKEND
  // -------------------------------
  useEffect(() => {
    async function fetchRoutes() {
      try {
        const res = await fetch("http://localhost:8000/route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });

        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          setRoutes(data.routes);

          const best = data.routes[0];

          setResult({
            selectedCrypto: "BANK_ROUTE",
            routeName: best.path.map(p => `${p[0]} (${p[1]})`).join(" → "),
            estimatedFee: best.summary.total_fee,
            estimatedTime: best.summary.total_time,
            score: best.summary.total_cost,
            explanation: "Optimized using routing engine with liquidity, FX, and rail constraints."
          });
        } else {
          setResult(null);
          setRoutes([]);
        }

      } catch (err) {
        console.error("API error:", err);
        setResult(null);
        setRoutes([]);
      }
    }

    fetchRoutes();
  }, [form]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className="app-shell">
      <GlobalBackground />
      <Navbar />

      <main className="app-main page-content-layer">

        {/* INPUT SECTION */}
        <section className="grid-two">
          <div className="glass-panel interactive-card">
            <div className="panel-content">

              <h2>Payment Inputs</h2>

              <div className="form-grid">

                <select name="sender_country" value={form.sender_country} onChange={handleChange}>
                  {COUNTRY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                </select>

                <select name="receiver_country" value={form.receiver_country} onChange={handleChange}>
                  {COUNTRY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                </select>

                <input type="number" name="amount" value={form.amount} onChange={handleChange} />

                <select name="currency" value={form.currency} onChange={handleChange}>
                  {CURRENCY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                </select>

              </div>
            </div>
          </div>

          {/* BEST ROUTE */}
          <div className="glass-panel interactive-card">
            <div className="panel-content">

              <h2>Best Route</h2>

              {result ? (
                <div
                  className="option-card"
                  style={{
                    "--option-glow": optionThemes[result.selectedCrypto] || optionThemes.BANK_ROUTE
                  }}
                >
                  <div>{result.routeName}</div>

                  <div>💰 Fee: {result.estimatedFee}</div>
                  <div>⏱ Time: {result.estimatedTime.toFixed(2)} hrs</div>
                  <div>📊 Score: {result.score.toFixed(2)}</div>

                  <p>{result.explanation}</p>
                </div>
              ) : (
                <p>No route found</p>
              )}

            </div>
          </div>
        </section>

        {/* ALL ROUTES */}
        <section className="glass-panel" style={{ marginTop: "20px" }}>
          <div className="panel-content">

            <h2>All Routes</h2>

            {routes.length === 0 && <p>No routes available</p>}

            {routes.map((route, idx) => (
              <div key={idx} className="option-card" style={{ marginBottom: "10px" }}>
                
                <div>
                  {route.path.map(p => `${p[0]} (${p[1]})`).join(" → ")}
                </div>

                <div>💰 Fee: {route.summary.total_fee}</div>
                <div>💱 FX Loss: {route.summary.total_fx_loss}</div>
                <div>⏱ Time: {route.summary.total_time.toFixed(2)} hrs</div>

              </div>
            ))}

          </div>
        </section>

      </main>
    </div>
  );
}