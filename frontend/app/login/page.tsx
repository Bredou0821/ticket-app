"use client";

import { useState } from "react";
import { QrCode, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Email ou mot de passe incorrect.");
        return;
      }
      const { access_token } = await res.json();
      document.cookie = `token=${access_token}; path=/; max-age=86400; SameSite=Lax`;
      router.push("/admin");
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #ebebeb",
    fontSize: 15,
    backgroundColor: "#f8f8f8",
    color: "#111",
    boxSizing: "border-box" as const,
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, backgroundColor: "#f8f8f8", borderRadius: 18, marginBottom: 16 }}>
            <QrCode size={30} style={{ color: "#111" }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Ticket-</h1>
          <p style={{ fontSize: 14, color: "#888", margin: 0 }}>Connectez-vous pour continuer</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Email</label>
            <input
              type="email"
              style={inputStyle}
              placeholder="admin@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Mot de passe</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: 48 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", padding: 4 }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ fontSize: 13, color: "#dc2626", margin: 0, fontWeight: 600 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: 8, padding: "15px", backgroundColor: "#111", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1, width: "100%" }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
