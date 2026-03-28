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
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand-mark stagger-1">
          <span className="brand-logo">AP</span>
          <span className="brand-text">
            <span className="brand-title">AtlasPay</span>
            <span className="brand-subtitle">Intelligent Treasury Rail</span>
          </span>
        </Link>

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
