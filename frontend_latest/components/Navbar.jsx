import Link from "next/link";

export default function Navbar() {
  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 10,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 40px",

      background: "rgba(10, 8, 8, 0.6)",
      backdropFilter: "blur(20px)",

      borderBottom: "1px solid rgba(230,183,169,0.15)",
      boxShadow: "0 0 30px rgba(230,183,169,0.05)"
    }}>

      {/* LOGO */}
      <div style={{
        fontWeight: "600",
        fontSize: "18px",
        letterSpacing: "1px",

        background: "linear-gradient(90deg, #e6b7a9, #f5d0c5, #e6b7a9)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",

        textShadow: "0 0 12px rgba(230,183,169,0.25)"
      }}>
        AtlasPay
      </div>

      {/* LINKS */}
      <div style={{ display: "flex", gap: "30px" }}>
        {["Dashboard", "Simulate", "Routes", "Risk"].map((item, i) => (
          <Link
            key={i}
            href={item === "Dashboard" ? "/" : `/${item.toLowerCase()}`}
            style={{
              position: "relative",
              color: "rgba(230,183,169,0.8)",
              textDecoration: "none",
              fontSize: "14px",
              letterSpacing: "0.5px",
              transition: "0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#f5d0c5";
              e.target.style.textShadow = "0 0 10px rgba(230,183,169,0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "rgba(230,183,169,0.8)";
              e.target.style.textShadow = "none";
            }}
          >
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}