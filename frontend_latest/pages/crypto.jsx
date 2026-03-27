import { useMemo, useState } from "react";
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

const CRYPTO_BASES = {
  ETH: { fee: 5, time: 60 },
  BTC: { fee: 4, time: 900 },
  USDC: { fee: 0.2, time: 5 },
  LIGHTNING: { fee: 0.02, time: 2 },
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

function simulateCrypto({
  sender_country,
  receiver_country,
  amount,
  currency,
  crypto,
}) {
  const base = CRYPTO_BASES[crypto];
  const safeAmount = Number(amount) || 0;
  const geoFactor = getGeoFactor(sender_country, receiver_country);
  const estimatedFee = base.fee * (1 + safeAmount / 10000);
  const estimatedTime = base.time * geoFactor;
  const routeName = `${sender_country} -> ${crypto} -> ${receiver_country}`;
  const senderRegion = getRegion(sender_country);
  const receiverRegion = getRegion(receiver_country);

  let geoExplanation = "Cross-region settlement applied.";
  if (sender_country === receiver_country) {
    geoExplanation = "Domestic transfer received the same-country speed multiplier.";
  } else if (senderRegion === receiverRegion) {
    geoExplanation = "Same-region transfer kept the base network timing.";
  }

  return {
    selectedCrypto: crypto,
    routeName,
    estimatedFee: Number(estimatedFee.toFixed(4)),
    estimatedTime: Number(estimatedTime.toFixed(2)),
    explanation: [
      `${crypto} was simulated for a ${currency} payment of ${safeAmount}.`,
      `Base fee ${base.fee} scaled with amount, and base time ${base.time}s was multiplied by ${geoFactor}.`,
      geoExplanation,
    ].join(" "),
    score: estimatedFee + estimatedTime / 100,
  };
}

function pickBestCrypto(input) {
  const candidates = ["ETH", "BTC", "USDC"].map((crypto) =>
    simulateCrypto({ ...input, crypto })
  );

  return candidates.reduce((best, current) =>
    current.score < best.score ? current : best
  );
}

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

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-emerald-400">
            Crypto Simulator
          </p>
          <h1 className="text-4xl font-bold">Deterministic Crypto Payment Routing</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Compare fixed crypto transfer paths using deterministic fee and timing
            rules with geographic weighting.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-emerald-500/10 backdrop-blur">
            <h2 className="mb-6 text-xl font-semibold">Simulation Inputs</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  sender_country
                </span>
                <select
                  name="sender_country"
                  value={form.sender_country}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                >
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  receiver_country
                </span>
                <select
                  name="receiver_country"
                  value={form.receiver_country}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                >
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">amount</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">currency</span>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                >
                  {CURRENCY_OPTIONS.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-300">crypto</span>
                <select
                  name="crypto"
                  value={form.crypto}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                >
                  {CRYPTO_OPTIONS.map((crypto) => (
                    <option key={crypto} value={crypto}>
                      {crypto}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-slate-950/80 to-cyan-500/10 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur">
            <h2 className="mb-6 text-xl font-semibold">Simulation Output</h2>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">selected crypto</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-400">
                  {result.selectedCrypto}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">route name</p>
                <p className="mt-1 text-lg font-medium">{result.routeName}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-slate-400">estimated fee</p>
                  <p className="mt-1 text-xl font-semibold">
                    {result.estimatedFee} {form.currency}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-slate-400">estimated time</p>
                  <p className="mt-1 text-xl font-semibold">
                    {result.estimatedTime} sec
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">explanation</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  {result.explanation}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
