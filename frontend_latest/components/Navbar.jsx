import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/simulate", label: "Payments" },
  { href: "/route", label: "Routes" },
  { href: "/crypto", label: "Crypto" },
  { href: "/risk", label: "Risk" },
  { href: "/logs", label: "Analytics" },
];

function Navbar() {
  const router = useRouter();

  return (
<<<<<<< HEAD
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
=======
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand-mark stagger-1">
          <span className="brand-logo">AP</span>
          <span className="brand-text">
            <span className="brand-title">AtlasPay</span>
            <span className="brand-subtitle">Intelligent Treasury Rail</span>
          </span>
        </Link>
>>>>>>> 6171ba9810199ccef3695e58d5702a3253794d93

        <nav className="nav-links stagger-2" aria-label="Primary">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? router.pathname === "/"
                : router.pathname.startsWith(item.href);
            const navDelay = `${80 + navItems.indexOf(item) * 70}ms`;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link${isActive ? " active" : ""}`}
                style={{ animationDelay: navDelay }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default memo(Navbar);
