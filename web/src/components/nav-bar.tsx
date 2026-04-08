"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Shield } from "lucide-react";

export function NavBar() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
      style={{
        height: "var(--nav-height)",
        background: "color-mix(in srgb, var(--color-surface) 80%, transparent)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <span
          className="text-sm font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-fg)" }}
        >
          CosX
        </span>
      </div>

      {/* Center: Product label */}
      <div className="flex items-center gap-2">
        <Shield size={14} style={{ color: "var(--color-accent)" }} />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-fg-secondary)",
          }}
        >
          Fund Compliance Agent
        </span>
      </div>

      {/* Right: Theme toggle */}
      <button
        onClick={() => setDark(!dark)}
        className="flex items-center justify-center rounded-full transition-colors duration-300"
        style={{
          width: 32,
          height: 32,
          color: "var(--color-fg-secondary)",
          border: "1px solid var(--color-border)",
        }}
        aria-label="Toggle theme"
      >
        {dark ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </nav>
  );
}
