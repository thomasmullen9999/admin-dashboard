"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

// Inside the component, add:

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const group = searchParams.get("group") ?? "";

  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const campaigns = [
    { key: "", label: "All Campaigns", icon: "", href: "/admin" },
    { key: "stats", label: "Stats", icon: "", href: "/admin/stats" },
    {
      key: "fairpay",
      label: "Fair Pay",
      icon: "",
      href: "/admin?group=fairpay",
    },
    { key: "pcp", label: "PCP", icon: "", href: "/admin?group=pcp" },
    { key: "diesel", label: "Diesel", icon: "", href: "/admin?group=diesel" },
    { key: "dpf", label: "DPF", icon: "", href: "/admin?group=dpf" },
  ];

  const bgColor = darkMode ? "#0f172a" : "#ffffff";
  const textColor = darkMode ? "#f1f5f9" : "#0f172a";
  const sidebarBg = darkMode ? "#1e293b" : "#f8fafc";
  const borderColor = darkMode ? "#334155" : "#e2e8f0";
  const hoverBg = darkMode ? "#334155" : "#f1f5f9";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 280,
          backgroundColor: sidebarBg,
          borderRight: `1px solid ${borderColor}`,
          padding: "24px 0",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ padding: "0 24px", marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: 0,
            }}
          >
            Maddison Clarke
          </h2>
          <p
            style={{
              fontSize: 13,
              color: darkMode ? "#94a3b8" : "#64748b",
              margin: "4px 0 0 0",
            }}
          >
            Lead Management System
          </p>
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "0 16px",
            flex: 1,
          }}
        >
          {campaigns.map((c) => {
            const isActive =
              (c.key === "" && pathname === "/admin" && group === "") ||
              (c.key === "stats" && pathname === "/admin/stats") ||
              (c.key !== "" && c.key !== "stats" && group === c.key);

            return (
              <Link
                key={c.key}
                href={c.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 10,
                  backgroundColor: isActive
                    ? darkMode
                      ? "#4f46e5"
                      : "#6366f1"
                    : "transparent",
                  color: isActive ? "#ffffff" : textColor,
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: isActive ? 600 : 500,
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = hoverBg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <span>{c.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Dark mode toggle */}
        <div style={{ padding: "0 24px", marginTop: "auto" }}>
          <button
            onClick={toggleDarkMode}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${borderColor}`,
              background: darkMode ? "#334155" : "#ffffff",
              color: textColor,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = darkMode
                ? "0 4px 12px rgba(0,0,0,0.3)"
                : "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span style={{ fontSize: 16 }}>{darkMode ? "☀️" : "🌙"}</span>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: 32,
          overflow: "auto",
          backgroundColor: darkMode ? "#0f172a" : "#f8fafc",
        }}
      >
        {/* Top bar with user info */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
            padding: "20px 28px",
            backgroundColor: darkMode ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            border: `1px solid ${borderColor}`,
            boxShadow: darkMode
              ? "0 4px 6px rgba(0,0,0,0.3)"
              : "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              T
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                Hi, {user?.name}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: darkMode ? "#94a3b8" : "#64748b",
                  marginTop: 2,
                }}
              >
                Welcome back to your dashboard
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 13,
              color: darkMode ? "#94a3b8" : "#64748b",
            }}
          >
            <span>🔔</span>
            <button
              onClick={logout}
              style={{
                fontSize: 13,
                color: darkMode ? "#94a3b8" : "#64748b",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
