import Link from "next/link";

export default function Navbar() {
  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 10,
      display: "flex",
      justifyContent: "space-between",
      padding: "20px 40px",
      background: "rgba(2,6,23,0.6)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)"
    }}>
      <div className="glow" style={{ fontWeight: "bold" }}>
        AtlasPay
      </div>

      <div style={{ display: "flex", gap: "25px" }}>
        <Link href="/">Dashboard</Link>
        <Link href="/simulate">Simulate</Link>
        <Link href="/route">Routes</Link>
        <Link href="/crypto">Crypto</Link>
        <Link href="/risk">Risk</Link>
      </div>
    </div>
  );
}
