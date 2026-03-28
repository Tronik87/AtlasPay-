import { memo, useCallback, useMemo, useState } from "react";
import GlobalBackground from "../components/GlobalBackground";
import Navbar from "../components/Navbar";

const REGION_MAP = {
  India: "Asia",
  China: "Asia",
  Singapore: "Asia",
  UK: "Europe",
  Germany: "Europe",
  France: "Europe",
  USA: "US",
  Canada: "US",
};

const COUNTRY_OPTIONS = [
  "India",
  "China",
  "Singapore",
  "UK",
  "Germany",
  "France",
  "USA",
  "Canada",
];

const CURRENCY_OPTIONS = ["USD", "INR", "GBP"];
const CRYPTO_OPTIONS = ["auto", "ETH", "BTC", "USDC", "LIGHTNING"];

const CURRENCY_TO_USD = {
  USD: 1,
  INR: 0.012,
  GBP: 1.27,
};

const CRYPTO_BASES = {
  ETH: {
    networkFeeUsd: 2.4,
    baseTimeSec: 95,
    spreadBps: 22,
    slippageBpsPer10k: 8,
    reliability: 0.988,
    liquidityDepthUsd: 250000,
    complianceRisk: 0.45,
    volatilityPenaltyUsd: 1.5,
    congestionMultiplier: 1.22,
  },
  BTC: {
    networkFeeUsd: 3.1,
    baseTimeSec: 620,
    spreadBps: 16,
    slippageBpsPer10k: 6,
    reliability: 0.995,
    liquidityDepthUsd: 340000,
    complianceRisk: 0.38,
    volatilityPenaltyUsd: 1.1,
    congestionMultiplier: 1.12,
  },
  USDC: {
    networkFeeUsd: 0.35,
    baseTimeSec: 11,
    spreadBps: 4,
    slippageBpsPer10k: 2.2,
    reliability: 0.997,
    liquidityDepthUsd: 700000,
    complianceRisk: 0.24,
    volatilityPenaltyUsd: 0.2,
    congestionMultiplier: 1.04,
  },
  LIGHTNING: {
    networkFeeUsd: 0.08,
    baseTimeSec: 4,
    spreadBps: 9,
    slippageBpsPer10k: 4,
    reliability: 0.975,
    liquidityDepthUsd: 45000,
    complianceRisk: 0.34,
    volatilityPenaltyUsd: 0.8,
    congestionMultiplier: 1.1,
  },
};

function getRegion(country) {
  return REGION_MAP[country] || "Other";
}

function getGeoFactor(senderCountry, receiverCountry) {
  if (senderCountry === receiverCountry) {
    return 0.8;
  }

  if (getRegion(senderCountry) === getRegion(receiverCountry)) {
    return 1.0;
  }

  return 1.3;
}

function getGeoProfile(senderCountry, receiverCountry) {
  if (senderCountry === receiverCountry) {
    return { timeMultiplier: 0.82, complianceMultiplier: 0.9, liquidityMultiplier: 0.92 };
  }

  if (getRegion(senderCountry) === getRegion(receiverCountry)) {
    return { timeMultiplier: 1, complianceMultiplier: 1.05, liquidityMultiplier: 1 };
  }

  return { timeMultiplier: 1.24, complianceMultiplier: 1.22, liquidityMultiplier: 1.16 };
}

function simulateCrypto({
  sender_country,
  receiver_country,
  amount,
  currency,
  crypto,
}) {
  const base = CRYPTO_BASES[crypto];
  const safeAmount = Math.max(Number(amount) || 0, 0);
  const fxRate = CURRENCY_TO_USD[currency] || 1;
  const amountUsd = safeAmount * fxRate;
  const geoFactor = getGeoFactor(sender_country, receiver_country);
  const geoProfile = getGeoProfile(sender_country, receiver_country);
  const notionalScale = 1 + amountUsd / 20000;
  const liquidityPressure = Math.max(0, amountUsd - base.liquidityDepthUsd) / base.liquidityDepthUsd;

  const networkFeeUsd = base.networkFeeUsd * notionalScale;
  const executionBps =
    base.spreadBps + base.slippageBpsPer10k * (amountUsd / 10000) * geoProfile.liquidityMultiplier;
  const executionCostUsd = amountUsd * (executionBps / 10000);
  const fxSettlementCostUsd = currency === "USD" ? 0 : amountUsd * 0.0008;
  const complianceCostUsd =
    amountUsd * 0.00045 * base.complianceRisk * geoProfile.complianceMultiplier;
  const estimatedFeeUsd = networkFeeUsd + executionCostUsd + fxSettlementCostUsd + complianceCostUsd;
  const estimatedFee = estimatedFeeUsd / fxRate;

  const liquidityDelaySec = base.baseTimeSec * 0.45 * liquidityPressure * geoProfile.liquidityMultiplier;
  const estimatedTime =
    base.baseTimeSec * geoProfile.timeMultiplier * base.congestionMultiplier + liquidityDelaySec;
  const routeName = `${sender_country} -> ${crypto} -> ${receiver_country}`;
  const senderRegion = getRegion(sender_country);
  const receiverRegion = getRegion(receiver_country);

  let geoExplanation = "Cross-region settlement applied.";
  if (sender_country === receiver_country) {
    geoExplanation = "Domestic transfer received the same-country speed multiplier.";
  } else if (senderRegion === receiverRegion) {
    geoExplanation = "Same-region transfer kept the base network timing.";
  }

  const reliabilityPenalty = (1 - base.reliability) * 24 * geoProfile.complianceMultiplier;
  const liquidityPenalty = liquidityPressure * 2.4;
  const score = estimatedFeeUsd + estimatedTime / 120 + reliabilityPenalty + base.volatilityPenaltyUsd + liquidityPenalty;

  return {
    selectedCrypto: crypto,
    routeName,
    estimatedFee: Number(estimatedFee.toFixed(4)),
    estimatedTime: Number(estimatedTime.toFixed(2)),
    explanation: [
      `${crypto} was simulated for a ${currency} payment of ${safeAmount}.`,
      `Cost combines network fee, spread/slippage, FX settlement, and corridor compliance overhead for an estimated ${estimatedFee.toFixed(4)} ${currency}.`,
      `Time combines base confirmation, corridor multiplier (${geoFactor}), congestion, and liquidity delay for ${estimatedTime.toFixed(2)} seconds.`,
      `${geoExplanation} Reliability and volatility penalties were also applied to the final score.`,
    ].join(" "),
    score,
  };
}

function pickBestCrypto(input) {
  const candidates = ["ETH", "BTC", "USDC", "LIGHTNING"].map((crypto) =>
    simulateCrypto({ ...input, crypto })
  );

  return candidates.reduce((best, current) =>
    current.score < best.score ? current : best
  );
}

const optionThemes = {
  ETH: "linear-gradient(135deg, rgba(139, 92, 246, 0.42), rgba(99, 102, 241, 0.16))",
  BTC: "linear-gradient(135deg, rgba(247, 147, 26, 0.42), rgba(251, 191, 36, 0.16))",
  USDC: "linear-gradient(135deg, rgba(37, 99, 235, 0.4), rgba(53, 200, 255, 0.16))",
  LIGHTNING: "linear-gradient(135deg, rgba(250, 204, 21, 0.42), rgba(245, 158, 11, 0.14))",
};

const comparisonCryptos = ["ETH", "BTC", "USDC", "LIGHTNING"];

const CryptoOptionCard = memo(function CryptoOptionCard({
  card,
  currency,
  isBest,
  isSelected,
  animationDelay,
}) {
  return (
    <div
      className={`option-card interactive-card${isBest ? " best" : ""}${isSelected ? " selected" : ""}`}
      style={{
        "--option-glow": optionThemes[card.selectedCrypto],
        animationDelay,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
        <div>
          <div className="metric-label">{card.selectedCrypto}</div>
          <div style={{ marginTop: "8px", fontSize: "1.15rem", fontWeight: 700, wordBreak: "break-word" }}>
            {card.routeName}
          </div>
        </div>
        {isBest ? <span className="best-badge">Best Option</span> : null}
      </div>

      <div className="option-meta">
        <div>
          <span>fee</span>
          <strong>
            {card.estimatedFee} {currency}
          </strong>
        </div>
        <div>
          <span>time</span>
          <strong>{card.estimatedTime} sec</strong>
        </div>
        <div>
          <span>score</span>
          <strong>{card.score.toFixed(4)}</strong>
        </div>
      </div>
    </div>
  );
});

export default function CryptoPage() {
  const [form, setForm] = useState({
    sender_country: "USA",
    receiver_country: "India",
    amount: "1000",
    currency: "USD",
    crypto: "auto",
  });

  const result = useMemo(() => {
    if (form.crypto === "auto") {
      return pickBestCrypto(form);
    }

    return simulateCrypto(form);
  }, [form]);

  const cryptoCards = useMemo(
    () =>
      comparisonCryptos.map((crypto) =>
        simulateCrypto({ ...form, crypto })
      ),
    [form]
  );

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }, []);

  return (
    <div className="app-shell">
      <GlobalBackground />
      <Navbar />

      <main className="app-main page-content-layer">
        <section className="hero">
          <div className="hero-copy glow-orbit">
            <span className="eyebrow">Crypto Routing</span>
            <h1>Evaluate crypto payment rails in a premium treasury simulation cockpit.</h1>
            <p>
              This screen uses a deterministic but more realistic route model that
              weighs fee composition, expected settlement time, liquidity depth, and reliability.
            </p>
          </div>

          <div className="hero-aside glass-panel float-soft stagger-2">
            <div className="panel-content">
              <div className="metric-label">Selection Mode</div>
              <div className="metric-value" style={{ fontSize: "2rem" }}>
                {form.crypto === "auto" ? "Auto" : "Manual"}
              </div>
              <p className="metric-foot">
                Auto mode now ranks options using a multi-factor score: cost, timing, reliability,
                volatility, and corridor liquidity pressure.
              </p>
            </div>
          </div>
        </section>

        <section className="grid-two">
          <div className="glass-panel interactive-card stagger-2">
            <div className="panel-content">
              <span className="eyebrow">Simulation Inputs</span>
              <h2 className="section-title" style={{ marginTop: "18px", fontSize: "1.6rem" }}>
                Payment corridor details
              </h2>
              <p className="section-copy">
                Enter the same countries, amount, currency, and asset preference to
                produce a deterministic crypto route evaluation.
              </p>

              <div className="form-grid" style={{ marginTop: "26px" }}>
                <label className="field">
                  <span className="field-label">sender_country</span>
                  <select
                    name="sender_country"
                    value={form.sender_country}
                    onChange={handleChange}
                    className="field-control"
                  >
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">receiver_country</span>
                  <select
                    name="receiver_country"
                    value={form.receiver_country}
                    onChange={handleChange}
                    className="field-control"
                  >
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">amount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    className="field-control"
                  />
                </label>

                <label className="field">
                  <span className="field-label">currency</span>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="field-control"
                  >
                    {CURRENCY_OPTIONS.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field full">
                  <span className="field-label">crypto</span>
                  <select
                    name="crypto"
                    value={form.crypto}
                    onChange={handleChange}
                    className="field-control"
                  >
                    {CRYPTO_OPTIONS.map((crypto) => (
                      <option key={crypto} value={crypto}>
                        {crypto}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="glass-panel interactive-card stagger-3">
            <div className="panel-content fade-slide">
              <span className="eyebrow">Selected Outcome</span>
              <h2 className="section-title" style={{ marginTop: "18px", fontSize: "1.6rem" }}>
                Recommended route snapshot
              </h2>
              <p className="section-copy">
                The output panel surfaces the current selected crypto, route quality,
                and explanation using the upgraded deterministic simulation formula.
              </p>

              <div style={{ marginTop: "24px", display: "grid", gap: "14px" }}>
                <div className="option-card best float-soft" style={{ "--option-glow": optionThemes[result.selectedCrypto] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                    <div>
                      <div className="metric-label">selected crypto</div>
                      <div className="metric-value" style={{ fontSize: "2.2rem", marginTop: "12px" }}>
                        {result.selectedCrypto}
                      </div>
                    </div>
                    <span className="best-badge">
                      {form.crypto === "auto" ? "Best Option" : "Selected"}
                    </span>
                  </div>

                  <div className="subtle-divider" style={{ margin: "18px 0" }} />

                  <div className="metric-label">route name</div>
                  <div style={{ marginTop: "8px", fontSize: "1.1rem", fontWeight: 600 }}>
                    {result.routeName}
                  </div>

                  <div className="option-meta">
                    <div>
                      <span>estimated fee</span>
                      <strong>
                        {result.estimatedFee} {form.currency}
                      </strong>
                    </div>
                    <div>
                      <span>estimated time</span>
                      <strong>{result.estimatedTime} sec</strong>
                    </div>
                    <div>
                      <span>score</span>
                      <strong>{result.score.toFixed(4)}</strong>
                    </div>
                  </div>
                </div>

                <div className="option-card stagger-4" style={{ "--option-glow": "linear-gradient(135deg, rgba(53, 200, 255, 0.2), rgba(139, 92, 246, 0.1))" }}>
                  <div className="metric-label">explanation</div>
                  <p className="metric-foot" style={{ marginTop: "12px", color: "var(--muted-strong)" }}>
                    {result.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel interactive-card stagger-4" style={{ marginTop: "24px" }}>
          <div className="panel-content">
            <span className="eyebrow">Route Matrix</span>
            <h2 className="section-title" style={{ marginTop: "18px", fontSize: "1.6rem" }}>
              Crypto option comparison
            </h2>
            <p className="section-copy">
              Every card below is derived from the same deterministic multi-factor simulation logic.
            </p>

            <div className="option-grid" style={{ marginTop: "26px" }}>
              {cryptoCards.map((card, index) => {
                const isBest = form.crypto === "auto" && card.selectedCrypto === result.selectedCrypto;
                const isSelected = form.crypto !== "auto" && card.selectedCrypto === result.selectedCrypto;

                return (
                  <CryptoOptionCard
                    key={card.selectedCrypto}
                    card={card}
                    currency={form.currency}
                    isBest={isBest}
                    isSelected={isSelected}
                    animationDelay={`${120 + index * 90}ms`}
                  />
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
