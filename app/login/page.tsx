"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          display: flex;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: #0d0d14;
        }

        /* Left panel */
        .left-panel {
          display: none;
          position: relative;
          width: 52%;
          overflow: hidden;
          background: linear-gradient(145deg, #1a1035 0%, #0f0a28 60%, #12082e 100%);
        }

        @media (min-width: 900px) {
          .left-panel { display: flex; flex-direction: column; justify-content: space-between; padding: 48px; }
        }

        .mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 20% 10%, rgba(102,78,234,0.45) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 80%, rgba(118,75,162,0.35) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(79,70,229,0.2) 0%, transparent 60%);
          pointer-events: none;
        }

        .grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
        }
        .orb-1 {
          width: 300px; height: 300px;
          top: -80px; left: -60px;
          background: rgba(99,102,241,0.3);
          animation: drift1 8s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 200px; height: 200px;
          bottom: 80px; right: -40px;
          background: rgba(139,92,246,0.25);
          animation: drift2 10s ease-in-out infinite alternate;
        }

        @keyframes drift1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 40px) scale(1.1); }
        }
        @keyframes drift2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-20px, -30px) scale(1.15); }
        }

        .left-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }

        .brand-name {
          font-family: 'DM Serif Display', serif;
          font-size: 20px;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .hero-text {
          margin-top: auto;
          padding-bottom: 16px;
        }

        .hero-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(167,139,250,0.8);
          margin-bottom: 20px;
        }

        .hero-heading {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(36px, 3.5vw, 52px);
          line-height: 1.1;
          color: #fff;
          margin-bottom: 20px;
        }

        .hero-heading em {
          font-style: italic;
          background: linear-gradient(90deg, #a78bfa, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(203,213,225,0.6);
          max-width: 360px;
        }

        .stats-row {
          display: flex;
          gap: 32px;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .stat-value {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .stat-label {
          font-size: 12px;
          color: rgba(148,163,184,0.6);
          margin-top: 2px;
        }

        /* Right panel */
        .right-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          background: #0d0d14;
          position: relative;
        }

        .form-container {
          width: 100%;
          max-width: 400px;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mobile-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
          justify-content: center;
        }
        @media (min-width: 900px) {
          .mobile-brand { display: none; }
        }

        .form-title {
          font-family: 'DM Serif Display', serif;
          font-size: 30px;
          color: #f8fafc;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }

        .form-subtitle {
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 36px;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 28px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #475569;
        }

        .field-input-wrap {
          position: relative;
        }

        .field-input {
          width: 100%;
          padding: 13px 16px;
          background: #13131f;
          border: 1px solid #1e2038;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #e2e8f0;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-appearance: none;
        }

        .field-input::placeholder { color: #2d3352; }

        .field-input:focus {
          border-color: #6366f1;
          background: #14142a;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        .field-input.has-toggle { padding-right: 48px; }

        .toggle-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #334155;
          font-size: 16px;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .toggle-btn:hover { color: #6366f1; }

        .error-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 13px 16px;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px;
          margin-bottom: 20px;
          animation: shake 0.35s ease;
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-6px); }
          75%      { transform: translateX(6px); }
        }

        .error-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }
        .error-text { font-size: 13px; color: #f87171; line-height: 1.5; }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(102,126,234,0.3);
          letter-spacing: 0.01em;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(102,126,234,0.4);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .form-footer {
          margin-top: 28px;
          text-align: center;
          font-size: 12px;
          color: #1e2440;
        }
      `}</style>

      <div className="login-root">
        {/* Left decorative panel */}
        <div className="left-panel">
          <div className="mesh" />
          <div className="grid-lines" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />

          <div className="left-content">
            <div className="brand">
              <div className="brand-icon">⚡</div>
              <span className="brand-name">Maddison Clarke</span>
            </div>

            <div className="hero-text">
              <p className="hero-eyebrow">Lead Management System</p>
              <h1 className="hero-heading">
                Manage your
                <br />
                leads with <em>clarity</em>
              </h1>
              <p className="hero-sub">
                One dashboard for every campaign — Fair Pay, PCP, Diesel, DPF
                and more. Track, filter, and act fast.
              </p>

              <div className="stats-row">
                <div>
                  <div className="stat-value">6</div>
                  <div className="stat-label">Campaigns</div>
                </div>
                <div>
                  <div className="stat-value">Real-time</div>
                  <div className="stat-label">Stats</div>
                </div>
                <div>
                  <div className="stat-value">1 place</div>
                  <div className="stat-label">All leads</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right login panel */}
        <div className="right-panel">
          <div className="form-container">
            <div className="mobile-brand">
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "linear-gradient(135deg,#667eea,#764ba2)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                ⚡
              </div>
              <span
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 18,
                  color: "#f8fafc",
                }}
              >
                Maddison Clarke
              </span>
            </div>

            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">
              Sign in to access your admin dashboard
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                <div className="field-group">
                  <label className="field-label">Email address</label>
                  <div className="field-input-wrap">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Password</label>
                  <div className="field-input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`field-input has-toggle`}
                    />
                    <button
                      type="button"
                      className="toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="error-box">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="submit-btn">
                <span className="btn-inner">
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </span>
              </button>
            </form>

            <p className="form-footer">
              Restricted access — authorised personnel only
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
