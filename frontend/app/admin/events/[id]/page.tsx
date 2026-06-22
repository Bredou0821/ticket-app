"use client";

export const runtime = 'edge';

import { useEffect, useState } from "react";
import { use } from "react";
import { ArrowLeft, Plus, Copy, Download, Check, QrCode } from "lucide-react";
import { getEvent, getTickets, createTicket, ticketImageUrl, type Event, type Ticket } from "@/lib/api";
import Link from "next/link";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [personName, setPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    try {
      const [ev, allTickets] = await Promise.all([getEvent(id), getTickets()]);
      setEvent(ev);
      setTickets(allTickets.filter((t) => t.event_id === id));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const ticket = await createTicket({ event_id: id, person_name: personName, phone: phone || undefined, email: email || undefined });
      setTickets((prev) => [ticket, ...prev]);
      setPersonName(""); setPhone(""); setEmail("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  function copyLink(ticketId: string) {
    const url = `${window.location.origin}/ticket/${ticketId}`;
    navigator.clipboard.writeText(url);
    setCopied(ticketId);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid #ebebeb", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#111",
    boxSizing: "border-box" as const,
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#fff", fontFamily: "inherit" }}>

      {/* Header */}
      <header style={{ padding: "16px 20px", borderBottom: "1px solid #ebebeb", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 }}>
        <Link href="/admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, backgroundColor: "#f8f8f8", color: "#111", textDecoration: "none", flexShrink: 0 }}>
          <ArrowLeft size={18} />
        </Link>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 16, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event?.name}</p>
          {event && (
            <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
              {new Date(event.date).toLocaleDateString("fr-FR", { dateStyle: "long" })}
              {event.location && ` · ${event.location}`}
            </p>
          )}
        </div>
      </header>

      <main style={{ padding: "24px 16px", maxWidth: 600, margin: "0 auto" }}>

        {/* Titre + bouton */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#111" }}>Tickets ({tickets.length})</h2>
          <button type="button" onClick={() => setShowForm(!showForm)}
            style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "#111", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Plus size={15} /> Nouveau
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <form onSubmit={handleCreate} style={{ backgroundColor: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: 14, padding: 20, marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Créer un ticket</p>
            <input
              style={inputStyle}
              placeholder="Nom complet de l'invité *"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              required
            />
            <input
              type="tel"
              style={inputStyle}
              placeholder="Numéro de téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="email"
              style={inputStyle}
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button type="submit" disabled={saving}
                style={{ flex: 1, padding: "12px", backgroundColor: "#111", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {saving ? "Création..." : "Créer le ticket"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ padding: "12px 16px", backgroundColor: "transparent", border: "1px solid #ddd", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#666" }}>
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Liste */}
        {tickets.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <QrCode size={40} style={{ color: "#ccc", margin: "0 auto 12px" }} />
            <p style={{ color: "#999", fontSize: 14 }}>Aucun ticket pour cet événement.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tickets.map((ticket) => (
              <div key={ticket.id} style={{ backgroundColor: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.person_name}</p>
                  <p style={{ fontSize: 11, color: "#888", margin: "3px 0 0", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                    #{ticket.qr_code_id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {ticket.is_used && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, backgroundColor: "#fee2e2", color: "#dc2626" }}>Utilisé</span>
                  )}
                  <button
                    type="button"
                    onClick={() => copyLink(ticket.id)}
                    title="Copier le lien"
                    style={{ width: 36, height: 36, borderRadius: 9, border: "none", backgroundColor: "#ebebeb", color: copied === ticket.id ? "#16a34a" : "#111", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    {copied === ticket.id ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                  <a
                    href={ticketImageUrl(ticket.id)}
                    download={`ticket-${ticket.person_name}.png`}
                    title="Télécharger le ticket"
                    style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                  >
                    <Download size={15} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
