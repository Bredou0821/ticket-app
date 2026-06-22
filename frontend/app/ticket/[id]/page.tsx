"use client";

export const runtime = 'edge';

import { useEffect, useRef, useState } from "react";
import { use } from "react";
import { Download, QrCode, MapPin, Calendar, User } from "lucide-react";
import { getTicket, getEvent, ticketQrUrl, type Event, type Ticket } from "@/lib/api";

const BG = "#edf2f7";
const GOLD = "#d4a017";
const WHITE = "#ffffff";
const TEXT = "#1a202c";
const MUTED = "#718096";
const BORDER = "#e2e8f0";

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const t = await getTicket(id);
        const ev = await getEvent(t.event_id);
        setTicket(t);
        setEvent(ev);
      } catch {
        setError("Ticket introuvable.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleDownload() {
    if (!cardRef.current || !ticket) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 3, backgroundColor: BG });
      const a = document.createElement("a");
      a.download = `ticket-${ticket.person_name.replace(/\s+/g, "-")}.png`;
      a.href = dataUrl;
      a.click();
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="loading loading-spinner loading-lg" style={{ color: GOLD }} />
      </div>
    );
  }

  if (error || !ticket || !event) {
    return (
      <div style={{ minHeight: "100dvh", backgroundColor: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <QrCode size={48} style={{ color: MUTED, opacity: 0.4 }} />
        <p style={{ color: MUTED }}>{error || "Ticket introuvable"}</p>
      </div>
    );
  }

  const dateStr = new Date(event.date).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  const timeStr = new Date(event.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Carte capturée */}
        <div ref={cardRef} style={{ backgroundColor: BG, padding: 16, borderRadius: 28 }}>
          <div style={{ backgroundColor: WHITE, borderRadius: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.12)", overflow: "hidden" }}>

            {/* Header doré */}
            <div style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #b8860b 100%)`, padding: "24px 24px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>Ticket d&apos;entrée</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontFamily: "monospace", letterSpacing: "0.1em" }}>#{ticket.qr_code_id.slice(0, 8).toUpperCase()}</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: WHITE, lineHeight: 1.1, margin: 0 }}>{event.name}</h1>
              {event.location && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
                  <MapPin size={12} style={{ color: "rgba(255,255,255,0.8)" }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{event.location}</span>
                </div>
              )}
            </div>

            {/* Séparateur avec demi-cercles */}
            <div style={{ position: "relative", height: 24, backgroundColor: WHITE }}>
              <div style={{ position: "absolute", left: -12, top: 0, width: 24, height: 24, borderRadius: "50%", backgroundColor: BG }} />
              <div style={{ position: "absolute", left: 12, right: 12, top: "50%", borderTop: `2px dashed ${BORDER}` }} />
              <div style={{ position: "absolute", right: -12, top: 0, width: 24, height: 24, borderRadius: "50%", backgroundColor: BG }} />
            </div>

            {/* Infos date + heure */}
            <div style={{ padding: "4px 24px 16px", display: "flex", gap: 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <Calendar size={11} style={{ color: GOLD }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em" }}>Date</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>{dateStr}</p>
              </div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em" }}>Heure</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>{timeStr}</p>
                {event.price != null && (
                  <p style={{ fontSize: 13, fontWeight: 800, color: GOLD, marginTop: 4 }}>
                    {event.price.toLocaleString("fr-FR")} FCFA
                  </p>
                )}
              </div>
            </div>

            {/* Séparateur 2 */}
            <div style={{ position: "relative", height: 24, backgroundColor: WHITE }}>
              <div style={{ position: "absolute", left: -12, top: 0, width: 24, height: 24, borderRadius: "50%", backgroundColor: BG }} />
              <div style={{ position: "absolute", left: 12, right: 12, top: "50%", borderTop: `2px dashed ${BORDER}` }} />
              <div style={{ position: "absolute", right: -12, top: 0, width: 24, height: 24, borderRadius: "50%", backgroundColor: BG }} />
            </div>

            {/* Passager */}
            <div style={{ padding: "4px 24px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <User size={11} style={{ color: GOLD }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em" }}>Invité</span>
              </div>
              <p style={{ fontSize: 22, fontWeight: 900, color: TEXT, margin: 0 }}>{ticket.person_name}</p>
            </div>

            {/* Séparateur 3 */}
            <div style={{ position: "relative", height: 24, backgroundColor: WHITE }}>
              <div style={{ position: "absolute", left: -12, top: 0, width: 24, height: 24, borderRadius: "50%", backgroundColor: BG }} />
              <div style={{ position: "absolute", left: 12, right: 12, top: "50%", borderTop: `2px dashed ${BORDER}` }} />
              <div style={{ position: "absolute", right: -12, top: 0, width: 24, height: 24, borderRadius: "50%", backgroundColor: BG }} />
            </div>

            {/* QR code */}
            <div style={{ padding: "12px 24px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.12em" }}>Boarding Pass</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ticketQrUrl(ticket.id)}
                alt="QR Code"
                crossOrigin="anonymous"
                style={{ width: 160, height: 160, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 6, backgroundColor: WHITE }}
              />
              <p style={{ fontSize: 11, color: MUTED, fontFamily: "monospace", letterSpacing: "0.2em", margin: 0 }}>
                {ticket.qr_code_id.slice(0, 8).toUpperCase()}
              </p>
            </div>

          </div>
        </div>

        {/* Bouton télécharger */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          style={{ backgroundColor: GOLD, color: WHITE, borderRadius: 14, width: "100%", padding: "14px 0", fontWeight: 700, fontSize: 15, border: "none", cursor: downloading ? "default" : "pointer", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: downloading ? 0.7 : 1 }}
        >
          {downloading ? <span className="loading loading-spinner loading-sm" /> : <Download size={18} />}
          {downloading ? "Génération en cours..." : "Télécharger mon ticket"}
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: MUTED, marginTop: 10 }}>
          Présentez ce QR code à l&apos;entrée de l&apos;événement
        </p>
      </div>
    </div>
  );
}
