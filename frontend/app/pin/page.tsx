"use client";

import { useState, useRef, useEffect } from "react";
import { QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PinPage() {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError("");

    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (digit && index === 3) {
      const pin = [...newDigits.slice(0, 3), digit].join("");
      if (pin.length === 4) submitPin(pin);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  }

  async function submitPin(pin: string) {
    setLoading(true);
    setError("");
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${API}/auth/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        setError("Code PIN incorrect.");
        setDigits(["", "", "", ""]);
        setShake(true);
        setTimeout(() => setShake(false), 600);
        inputRefs[0].current?.focus();
        return;
      }
      const { access_token } = await res.json();
      document.cookie = `token=${access_token}; path=/; max-age=86400; SameSite=Lax`;
      router.push("/admin");
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
      <div style={{ width: "100%", maxWidth: 320, textAlign: "center" }}>

        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, backgroundColor: "#f8f8f8", borderRadius: 18, marginBottom: 16 }}>
            <QrCode size={30} style={{ color: "#111" }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 6px", letterSpacing: "-0.3px" }}>Code de sécurité</h1>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Session expirée. Entrez votre code PIN à 4 chiffres.</p>
        </div>

        {/* PIN inputs */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24, animation: shake ? "shake 0.4s ease" : "none" }}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: 56,
                height: 64,
                textAlign: "center",
                fontSize: 24,
                fontWeight: 800,
                borderRadius: 14,
                border: `2px solid ${error ? "#dc2626" : digit ? "#111" : "#ebebeb"}`,
                backgroundColor: digit ? "#f8f8f8" : "#fff",
                color: "#111",
                outline: "none",
              }}
            />
          ))}
        </div>

        {loading && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ width: 24, height: 24, border: "2px solid #ebebeb", borderTopColor: "#111", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
          </div>
        )}

        {error && (
          <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 600, marginBottom: 16 }}>{error}</p>
        )}

        <button
          type="button"
          onClick={() => router.push("/login")}
          style={{ background: "none", border: "none", fontSize: 13, color: "#888", cursor: "pointer", textDecoration: "underline" }}
        >
          Connexion avec email et mot de passe
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
