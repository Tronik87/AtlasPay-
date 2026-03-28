"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";
import DashboardBackground from "../components/DashboardBackground";
import TransactionCard from "../components/TransactionCard";
import Link from "next/link";

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
    <video
      autoPlay
      loop
      muted
      playsInline
      className="bg-video"
    >
      <source src="/videos/bg.mp4" type="video/mp4" />
    </video>

    <div className="bg-overlay" />

    <div className="page-content-layer">
      <Navbar />

      <main className="app-main">

        {/* HERO */}
        <section className="hero-center">
          <div className="hero-circle" ref={circleRef}>
            <div className="circle-inner" />
            <h1 className="hero-text" ref={textRef}>
              AtlasPay
            </h1>
          </div>

          <p ref={subRef} className="hero-sub">
            Intelligent cross-border routing with real-time optimization
          </p>

          <button className="primary-btn">
            Enter System
          </button>
        </section>

        {/* METRICS */}
        <section className="metric-grid">
          <div className="metric-card interactive-card">
            <p className="metric-label">Transactions Routed</p>
            <div className="metric-value">128</div>
            <p className="metric-foot">Across all corridors</p>
          </div>

          <div className="metric-card interactive-card">
            <p className="metric-label">Avg Cost Efficiency</p>
            <div className="metric-value">$11.42</div>
            <p className="metric-foot">Optimized vs baseline</p>
          </div>

          <div className="metric-card interactive-card">
            <p className="metric-label">FX Conversions</p>
            <div className="metric-value">36</div>
            <p className="metric-foot">Across routed paths</p>
          </div>

          <div className="metric-card interactive-card">
            <p className="metric-label">Anomaly Alerts</p>
            <div className="metric-value" style={{ color: "#fb7185" }}>
              3
            </div>
            <p className="metric-foot">Flagged by system</p>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="grid-two">
          <div className="glass-panel interactive-card">
            <div className="panel-content">
              <span className="eyebrow">Routing</span>
              <h2 className="section-title">Simulate a transfer</h2>
              <p className="section-copy">
                Run real-time routing across corridors and rails.
              </p>

              <Link href="/simulate" className="button-primary">
                Go to Simulation
              </Link>
            </div>
          </div>

          <div className="glass-panel interactive-card">
            <div className="panel-content">
              <span className="eyebrow">Analytics</span>
              <h2 className="section-title">View transaction logs</h2>
              <p className="section-copy">
                Analyze cost, risk, and routing decisions.
              </p>

              <Link href="/logs" className="button-primary">
                View Logs
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  </div>
);
}