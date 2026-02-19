"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false); // prevent hydration mismatch

  // Only run on client
  useEffect(() => {
    setMounted(true);

    // Read current theme from localStorage or html attribute
    const storedTheme = localStorage.getItem("admin-theme") as
      | "light"
      | "dark"
      | null;

    const initialTheme =
      storedTheme ||
      (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("admin-theme", next);
    document.documentElement.dataset.theme = next;
  };

  // Avoid rendering until mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      style={{
        marginTop: 16,
        padding: "6px 10px",
        fontSize: 14,
        borderRadius: 6,
        border: "1px solid #d1d5db",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
    </button>
  );
}
