"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, QrCode, ArrowLeft, ScanLine } from "lucide-react";
import { scanTicket, type ScanResult } from "@/lib/api";
import Link from "next/link";

export default function ScanPage() {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrRef = useRef<any>(null);

  useEffect(() => {
    let scanner: unknown;

    async function startScanner() {
      const { Html5Qrcode } = await import("html5-qrcode");
      scanner = new Html5Qrcode("qr-reader");
      html5QrRef.current = scanner;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (scanner as any).start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText: string) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (scanner as any).stop();
            setScanning(false);
            try {
              const res = await scanTicket(decodedText);
              setResult(res);
            } catch {
              setError("QR code non reconnu.");
            }
          },
          () => {}
        );
      } catch {
        setError("Impossible d'accéder à la caméra.");
        setScanning(false);
      }
    }

    startScanner();

    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  function reset() {
    setResult(null);
    setError("");
    setScanning(true);
    if (html5QrRef.current) {
      html5QrRef.current
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText: string) => {
            await html5QrRef.current.stop();
            setScanning(false);
            try {
              const res = await scanTicket(decodedText);
              setResult(res);
            } catch {
              setError("QR code non reconnu.");
            }
          },
          () => {}
        )
        .catch(() => setError("Impossible d'accéder à la caméra."));
    }
  }

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#fff", fontFamily: "inherit" }}>

      {/* Header */}
      <header style={{ padding: "16px 20px", borderBottom: "1px solid #ebebeb", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 }}>
        <Link href="/admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, backgroundColor: "#f8f8f8", color: "#111", textDecoration: "none" }}>
          <ArrowLeft size={18} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ScanLine size={18} style={{ color: "#111" }} />
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.3px", color: "#111" }}>Scanner un ticket</span>
        </div>
      </header>

      <main style={{ maxWidth: 400, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

        {/* Zone scanner */}
        {scanning && (
          <div style={{ width: "100%" }}>
            <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginBottom: 16 }}>
              Pointez la caméra vers le QR code du ticket
            </p>
            <div
              id="qr-reader"
              ref={scannerRef}
              style={{ borderRadius: 16, overflow: "hidden", border: "2px solid #ebebeb", width: "100%" }}
            />
          </div>
        )}

        {/* Résultat valide */}
        {result && result.valid && (
          <div style={{ width: "100%", backgroundColor: "#f0fdf4", border: "2px solid #86efac", borderRadius: 20, padding: "32px 24px", textAlign: "center" }}>
            <CheckCircle size={56} style={{ color: "#16a34a", margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#16a34a", margin: "0 0 8px" }}>Ticket valide</h2>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 6px" }}>{result.ticket.person_name}</p>
            <p style={{ fontSize: 12, color: "#888", fontFamily: "monospace", letterSpacing: "0.1em", margin: "0 0 24px" }}>
              {result.ticket.qr_code_id.slice(0, 8).toUpperCase()}
            </p>
            <button type="button" onClick={reset}
              style={{ width: "100%", padding: "14px", backgroundColor: "#111", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              Scanner un autre
            </button>
          </div>
        )}

        {/* Résultat invalide */}
        {result && !result.valid && (
          <div style={{ width: "100%", backgroundColor: "#fff5f5", border: "2px solid #fecaca", borderRadius: 20, padding: "32px 24px", textAlign: "center" }}>
            <XCircle size={56} style={{ color: "#dc2626", margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#dc2626", margin: "0 0 8px" }}>Ticket déjà utilisé</h2>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 24px" }}>{result.message}</p>
            <button type="button" onClick={reset}
              style={{ width: "100%", padding: "14px", backgroundColor: "#111", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              Scanner un autre
            </button>
          </div>
        )}

        {/* Erreur */}
        {error && !result && (
          <div style={{ width: "100%", backgroundColor: "#fff5f5", border: "2px solid #fecaca", borderRadius: 20, padding: "32px 24px", textAlign: "center" }}>
            <XCircle size={48} style={{ color: "#dc2626", margin: "0 auto 16px" }} />
            <p style={{ fontSize: 14, color: "#dc2626", fontWeight: 600, margin: "0 0 24px" }}>{error}</p>
            <button type="button" onClick={reset}
              style={{ width: "100%", padding: "14px", backgroundColor: "#111", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              Réessayer
            </button>
          </div>
        )}

        {/* Idle hint */}
        {!scanning && !result && !error && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <QrCode size={40} style={{ color: "#ccc", margin: "0 auto 12px" }} />
            <p style={{ color: "#888", fontSize: 14 }}>Aucun QR code détecté</p>
          </div>
        )}
      </main>
    </div>
  );
}
