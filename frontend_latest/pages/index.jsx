"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";
import DashboardBackground from "../components/DashboardBackground";
import TransactionCard from "../components/TransactionCard";

const volumeSeries = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 58 },
  { label: "Wed", value: 64 },
  { label: "Thu", value: 71 },
  { label: "Fri", value: 86 },
];

export default function Home() {
  const circleRef = useRef(null);
  const textRef = useRef(null);
  const subRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // ENTRY ANIMATION
    tl.from(circleRef.current, {
      scale: 0.7,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out"
    });

    tl.from(textRef.current, {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    }, "-=0.6");

    tl.from(subRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8
    }, "-=0.6");

    // FLOATING MOTION
    gsap.to(circleRef.current, {
      y: 15,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // MOUSE PARALLAX
    const move = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;

      gsap.to(circleRef.current, {
        x,
        y,
        duration: 0.5,
        ease: "power2.out"
      });

      gsap.to(textRef.current, {
        x: x * 0.5,
        y: y * 0.5,
        duration: 0.5
      });
    };

    window.addEventListener("mousemove", move);

    // CLEANUP
    return () => {
      window.removeEventListener("mousemove", move);
      tl.kill();
    };
  }, []);

  return (
    <div className="app-shell">
      <DashboardBackground />
      <Navbar />

      <main className="app-main page-content-layer">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Treasury Control Center</span>
            <h1>Premium payment orchestration for high-trust global settlement.</h1>
            <p>
              AtlasPay brings routing, crypto simulation, and operational visibility
              into one disciplined interface built for speed, clarity, and confidence.
            </p>
          </div>

          <div className="hero-aside glass-panel">
            <div className="panel-content">
              <div className="metric-label">System Health</div>
              <div className="metric-value" style={{ fontSize: "2.2rem" }}>
                99.98%
              </div>
              <p className="metric-foot">
                Treasury rails stable across payments, routing, and risk surfaces.
              </p>
            </div>
          </div>
        </section>

        <section className="metric-grid">
          <TransactionCard
            label="Total Volume"
            value="$2.84M"
            footnote="124 routed transactions under active treasury supervision."
          />
          <TransactionCard
            label="Average Fee"
            value="$8.2"
            footnote="Blended network and conversion cost across the current routing mix."
            glow="violet"
          />
          <TransactionCard
            label="Fastest Route"
            value="A → C → D"
            footnote="Primary corridor currently holding the shortest simulated settlement window."
          />
        </section>

        <section className="grid-two" style={{ marginTop: "24px" }}>
          <div className="glass-panel interactive-card">
            <div className="panel-content">
              <span className="eyebrow">Flow Overview</span>
              <h2 className="section-title" style={{ marginTop: "18px", fontSize: "1.65rem" }}>
                Weekly volume composition
              </h2>
              <p className="section-copy">
                A static, derived overview of recent payment momentum based on the
                current dashboard snapshot.
              </p>

              <div className="tiny-chart" style={{ marginTop: "28px" }}>
                {volumeSeries.map((item, index) => (
                  <div key={item.label} style={{ flex: 1 }}>
                    <div
                      className={`tiny-bar${index % 2 === 0 ? "" : " alt"}`}
                      style={{ height: `${item.value * 1.6}px` }}
                    />
                    <div className="tiny-caption">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel interactive-card">
            <div className="panel-content">
              <span className="eyebrow">Operational Brief</span>
              <h2 className="section-title" style={{ marginTop: "18px", fontSize: "1.65rem" }}>
                Today&apos;s control signals
              </h2>
              <p className="section-copy">
                Built to surface the signals operators care about first: risk, speed,
                and cost quality.
              </p>

              <div style={{ marginTop: "28px", display: "grid", gap: "14px" }}>
                <div className="option-card">
                  <div className="metric-label">Risk Alerts</div>
                  <div className="metric-value" style={{ color: "#fb7185", fontSize: "2rem" }}>
                    3
                  </div>
                  <p className="metric-foot">
                    Elevated corridors remain contained within expected operating bands.
                  </p>
                </div>
                <div className="option-card">
                  <div className="metric-label">Liquidity Coverage</div>
                  <div className="metric-value" style={{ fontSize: "2rem" }}>
                    86%
                  </div>
                  <p className="metric-foot">
                    Global liquidity posture supports stable payment execution across core rails.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}