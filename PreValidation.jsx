import { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:8000";

const CHECK_ICONS = {
  idle: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="#2a3a4a" strokeWidth="1.5" />
    </svg>
  ),
  running: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: "spin 1s linear infinite" }}>
      <circle cx="9" cy="9" r="7" stroke="#1a6aff" strokeWidth="2" strokeDasharray="22 22" strokeLinecap="round" />
    </svg>
  ),
  PASS: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" fill="#0d2e1a" stroke="#00e676" strokeWidth="1.5" />
      <path d="M5.5 9L7.8 11.5L12.5 6.5" stroke="#00e676" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  WARN: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" fill="#2a1f00" stroke="#ffb300" strokeWidth="1.5" />
      <path d="M9 5.5V10" stroke="#ffb300" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="12.5" r="0.8" fill="#ffb300" />
    </svg>
  ),
  FAIL: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" fill="#2e0d0d" stroke="#ff3d3d" strokeWidth="1.5" />
      <path d="M6 6L12 12M12 6L6 12" stroke="#ff3d3d" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

const STATUS_COLOR = { PASS: "#00e676", WARN: "#ffb300", FAIL: "#ff3d3d", idle: "#2a3a4a", running: "#1a6aff" };

const COUNTRIES = ["India", "United States", "United Kingdom", "Germany", "France", "Brazil", "Japan", "Australia", "Canada", "Singapore"];

const DEFAULT_FORM = {
  sender_address: "",
  receiver_address: "",
  sender_country: "India",
  receiver_country: "United Kingdom",
  amount_usd: "",
  currency_from: "",
  currency_to: "",
};

export default function PreValidation({ onValidated }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [checkStates, setCheckStates] = useState([]);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const CHECK_LABELS = [
    "Wallet / Address Format",
    "Sanctions Screening",
    "Currency Compatibility",
    "Rail Availability",
    "Amount & Regulatory Limits",
    "Velocity & Rate Limits",
  ];

  useEffect(() => {
    setCheckStates(CHECK_LABELS.map((label) => ({ label, status: "idle", detail: "", latency_ms: 0 })));
  }, []);

  const updateField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const runValidation = async () => {
    setRunning(true);
    setResult(null);
    setError(null);
    setCheckStates(CHECK_LABELS.map((label) => ({ label, status: "idle", detail: "", latency_ms: 0 })));

    // Animate checks as running one by one
    for (let i = 0; i < CHECK_LABELS.length; i++) {
      setCheckStates((prev) =>
        prev.map((c, idx) => (idx === i ? { ...c, status: "running" } : c))
      );
      await new Promise((r) => setTimeout(r, 120 + Math.random() * 80));
    }

    try {
      const res = await fetch(`${API_BASE}/api/prevalidation/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount_usd: parseFloat(form.amount_usd) || 0,
        }),
      });

      const data = await res.json();

      // Animate results in sequence
      const filled = CHECK_LABELS.map((label) => {
        const found = data.checks?.find((c) => c.check === label);
        return found || { label, status: "idle", detail: "Not reached", latency_ms: 0 };
      });

      for (let i = 0; i < filled.length; i++) {
        await new Promise((r) => setTimeout(r, 180));
        setCheckStates((prev) =>
          prev.map((c, idx) => (idx === i ? { ...filled[i], label: CHECK_LABELS[i] } : c))
        );
      }

      setResult(data);
      if (data.valid && onValidated) {
        onValidated(data);
      }
    } catch (e) {
      setError("Backend unreachable. Ensure FastAPI is running on port 8000.");
      setCheckStates((prev) => prev.map((c) => c.status === "running" ? { ...c, status: "FAIL", detail: "Connection failed" } : c));
    } finally {
      setRunning(false);
    }
  };

  const canSubmit = form.sender_address && form.receiver_address && form.amount_usd && !running;

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .check-row { animation: fadeSlideIn 0.25s ease forwards; }
        .field input, .field select { background: #0a1520; border: 1px solid #1a2a3a; color: #c8d8e8; font-family: 'IBM Plex Mono', monospace; font-size: 13px; padding: 10px 14px; border-radius: 6px; width: 100%; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .field input:focus, .field select:focus { border-color: #1a6aff; }
        .field select option { background: #0a1520; }
        .submit-btn { background: linear-gradient(135deg, #0d3aff 0%, #0066cc 100%); color: #fff; border: none; padding: 13px 32px; border-radius: 7px; font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; width: 100%; transition: opacity 0.2s, transform 0.1s; }
        .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .rail-pill { display: inline-block; background: #0d2535; border: 1px solid #1a4060; color: #4ab8ff; font-family: 'IBM Plex Mono', monospace; font-size: 11px; padding: 3px 10px; border-radius: 20px; margin: 3px 3px 0 0; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoAtlas}>ATLAS</span>
          <span style={styles.logoPay}>PAY</span>
        </div>
        <div style={styles.badge}>PRE-VALIDATION ENGINE</div>
      </div>

      <div style={styles.layout}>
        {/* LEFT — Form */}
        <div style={styles.panel}>
          <div style={styles.sectionLabel}>TRANSACTION PARAMETERS</div>

          <div style={styles.row}>
            <div className="field" style={styles.field}>
              <label style={styles.label}>SENDER COUNTRY</label>
              <select value={form.sender_country} onChange={(e) => updateField("sender_country", e.target.value)}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field" style={styles.field}>
              <label style={styles.label}>RECEIVER COUNTRY</label>
              <select value={form.receiver_country} onChange={(e) => updateField("receiver_country", e.target.value)}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label style={styles.label}>SENDER WALLET ADDRESS</label>
            <input
              placeholder="0x..."
              value={form.sender_address}
              onChange={(e) => updateField("sender_address", e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label style={styles.label}>RECEIVER WALLET ADDRESS</label>
            <input
              placeholder="0x..."
              value={form.receiver_address}
              onChange={(e) => updateField("receiver_address", e.target.value)}
              spellCheck={false}
            />
          </div>

          <div style={styles.row}>
            <div className="field" style={styles.field}>
              <label style={styles.label}>AMOUNT (USD)</label>
              <input
                type="number"
                placeholder="200"
                value={form.amount_usd}
                onChange={(e) => updateField("amount_usd", e.target.value)}
              />
            </div>
            <div className="field" style={styles.field}>
              <label style={styles.label}>CURRENCY FROM (optional)</label>
              <input
                placeholder="INR"
                value={form.currency_from}
                onChange={(e) => updateField("currency_from", e.target.value.toUpperCase())}
              />
            </div>
            <div className="field" style={styles.field}>
              <label style={styles.label}>CURRENCY TO (optional)</label>
              <input
                placeholder="GBP"
                value={form.currency_to}
                onChange={(e) => updateField("currency_to", e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <button className="submit-btn" disabled={!canSubmit} onClick={runValidation} style={{ marginTop: 8 }}>
            {running ? "VALIDATING..." : "RUN PRE-VALIDATION"}
          </button>

          {error && (
            <div style={styles.errorBox}>{error}</div>
          )}
        </div>

        {/* RIGHT — Checks */}
        <div style={styles.panel}>
          <div style={styles.sectionLabel}>VALIDATION CHECKS</div>

          <div style={styles.checkList}>
            {checkStates.map((c, i) => (
              <div key={i} className="check-row" style={styles.checkRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    {CHECK_ICONS[c.status] || CHECK_ICONS.idle}
                  </span>
                  <span style={{ ...styles.checkLabel, color: c.status === "idle" ? "#3a5060" : "#c8d8e8" }}>
                    {c.label}
                  </span>
                  {c.latency_ms > 0 && (
                    <span style={styles.latency}>{c.latency_ms}ms</span>
                  )}
                </div>
                {c.detail && c.status !== "idle" && (
                  <div style={{ ...styles.checkDetail, color: STATUS_COLOR[c.status] || "#607080" }}>
                    {c.detail}
                  </div>
                )}
                {c.status === "running" && (
                  <div style={styles.runningBar}>
                    <div style={styles.runningBarInner} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Result Summary */}
          {result && (
            <div style={{ ...styles.resultBox, borderColor: result.valid ? "#00e676" : "#ff3d3d" }}>
              <div style={styles.resultHeader}>
                <span style={{ color: result.valid ? "#00e676" : "#ff3d3d", fontWeight: 700, fontSize: 15 }}>
                  {result.valid ? "✓ TRANSACTION CLEARED" : "✗ TRANSACTION BLOCKED"}
                </span>
                <span style={styles.validationId}>{result.validation_id}</span>
              </div>

              {result.blocked_reason && (
                <div style={styles.blockedReason}>{result.blocked_reason}</div>
              )}

              <div style={styles.metaRow}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>RISK SCORE</span>
                  <span style={{
                    ...styles.metaValue,
                    color: result.risk_score < 0.3 ? "#00e676" : result.risk_score < 0.6 ? "#ffb300" : "#ff3d3d"
                  }}>
                    {(result.risk_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>CHECKS</span>
                  <span style={styles.metaValue}>{result.checks?.length || 0}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>TIMESTAMP</span>
                  <span style={{ ...styles.metaValue, fontSize: 10 }}>
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {result.available_rails?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={styles.metaLabel}>AVAILABLE RAILS</div>
                  <div style={{ marginTop: 6 }}>
                    {result.available_rails.map((r) => (
                      <span key={r} className="rail-pill">{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    background: "#060e18",
    minHeight: "100vh",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#c8d8e8",
    padding: "0 0 60px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 36px",
    borderBottom: "1px solid #0d1e2e",
    marginBottom: 32,
  },
  logo: { display: "flex", alignItems: "baseline", gap: 1 },
  logoAtlas: { fontSize: 22, fontWeight: 700, color: "#1a6aff", letterSpacing: 2 },
  logoPay: { fontSize: 22, fontWeight: 700, color: "#00e676", letterSpacing: 2 },
  badge: {
    background: "#0a1a2a",
    border: "1px solid #1a3050",
    color: "#4a8ab0",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    letterSpacing: 2,
    padding: "5px 14px",
    borderRadius: 4,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 36px",
  },
  panel: {
    background: "#080f1a",
    border: "1px solid #0d1e2e",
    borderRadius: 12,
    padding: 28,
  },
  sectionLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    letterSpacing: 3,
    color: "#2a5070",
    marginBottom: 20,
  },
  row: { display: "flex", gap: 12, marginBottom: 14 },
  field: { flex: 1 },
  label: {
    display: "block",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 9,
    letterSpacing: 2,
    color: "#2a5070",
    marginBottom: 6,
  },
  checkList: { display: "flex", flexDirection: "column", gap: 4 },
  checkRow: {
    padding: "10px 14px",
    background: "#060d16",
    border: "1px solid #0d1e2e",
    borderRadius: 8,
  },
  checkLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    fontWeight: 500,
  },
  checkDetail: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    marginTop: 5,
    marginLeft: 28,
    lineHeight: 1.5,
  },
  latency: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 9,
    color: "#1a3a5a",
    marginLeft: "auto",
  },
  runningBar: {
    height: 2,
    background: "#0d1e2e",
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  runningBarInner: {
    height: "100%",
    width: "40%",
    background: "#1a6aff",
    borderRadius: 2,
    animation: "pulse 1s ease infinite",
  },
  resultBox: {
    marginTop: 20,
    background: "#060d16",
    border: "1px solid",
    borderRadius: 10,
    padding: 18,
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  validationId: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    color: "#2a4a6a",
  },
  blockedReason: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: "#ff6060",
    background: "#1a0808",
    border: "1px solid #3a1010",
    borderRadius: 6,
    padding: "8px 12px",
    marginBottom: 12,
  },
  metaRow: { display: "flex", gap: 20 },
  metaItem: { display: "flex", flexDirection: "column", gap: 4 },
  metaLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 9,
    letterSpacing: 2,
    color: "#2a5070",
  },
  metaValue: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 13,
    fontWeight: 500,
    color: "#c8d8e8",
  },
  errorBox: {
    marginTop: 12,
    background: "#1a0808",
    border: "1px solid #3a1010",
    color: "#ff6060",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    padding: "10px 14px",
    borderRadius: 6,
  },
};
