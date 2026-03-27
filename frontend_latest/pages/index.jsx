"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";

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
    <div style={{ position: "relative", height: "100vh" }}>
      
      {/* BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.25) contrast(1.1)"
        }}
      >
        <source src="/videos/bg.mp4" type="video/mp4" />
      </video>

      {/* MATTE OVERLAY */}
      <div style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)"
      }} />

      {/* CONTENT */}
      <div style={{
        position: "relative",
        zIndex: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}>
        <Navbar />

        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center"
        }}>

          {/* HERO CIRCLE */}
          <div className="hero-circle" ref={circleRef}>
            <div className="circle-inner" />

            <h1 className="hero-text" ref={textRef}>
              AtlasPay
            </h1>
          </div>

          {/* SUBTEXT */}
          <p
            ref={subRef}
            style={{
              marginTop: "20px",
              color: "rgba(255,255,255,0.6)",
              maxWidth: "500px"
            }}
          >
            Intelligent cross-border routing with real-time cost optimization and anomaly detection
          </p>

          {/* BUTTON */}
          <button style={{
            marginTop: "30px",
            padding: "12px 28px",
            borderRadius: "999px",
            border: "1px solid rgba(230,183,169,0.4)",
            background: "rgba(230,183,169,0.08)",
            color: "#e6b7a9",
            cursor: "pointer",
            transition: "0.3s"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(230,183,169,0.2)";
            e.target.style.boxShadow = "0 0 20px rgba(230,183,169,0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(230,183,169,0.08)";
            e.target.style.boxShadow = "none";
          }}
          >
            Enter System
          </button>

        </div>
      </div>
    </div>
  );
}