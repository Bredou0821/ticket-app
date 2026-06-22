"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronRight, QrCode, ScanLine, X } from "lucide-react";
import { getEvents, createEvent, deleteEvent, type Event } from "@/lib/api";
import Link from "next/link";

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", date: "", location: "", price: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    try { setEvents(await getEvents()); } finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await createEvent({ ...form, date: new Date(form.date).toISOString(), price: form.price ? parseFloat(form.price) : undefined });
      setForm({ name: "", description: "", date: "", location: "", price: "" });
      setShowForm(false);
      await loadEvents();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet événement ?")) return;
    await deleteEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    fontSize: 15,
    backgroundColor: "#fff",
    color: "#111",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#fff", fontFamily: "inherit", paddingBottom: 88 }}>

      {/* Header */}
      <header style={{ padding: "16px 20px", borderBottom: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <QrCode size={20} />
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.3px" }}>Ticket-</span>
        </div>
        <Link href="/scan" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#111", textDecoration: "none", backgroundColor: "#f3f3f3", borderRadius: 8, padding: "8px 12px" }}>
          <ScanLine size={15} /> Scanner
        </Link>
      </header>

      <main style={{ padding: "24px 16px", maxWidth: 600, margin: "0 auto" }}>

        <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px", color: "#111" }}>
          Événements {!loading && events.length > 0 && <span style={{ fontSize: 14, fontWeight: 500, color: "#888" }}>({events.length})</span>}
        </h1>

        {/* Formulaire */}
        {showForm && (
          <form onSubmit={handleCreate} style={{ backgroundColor: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: 14, padding: 20, marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Nouvel événement</p>
            {[
              { placeholder: "Nom de l'événement *", key: "name", required: true },
              { placeholder: "Description", key: "description" },
              { placeholder: "Lieu", key: "location" },
            ].map(({ placeholder, key, required }) => (
              <input key={key} placeholder={placeholder} required={required}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={inputStyle}
              />
            ))}
            <input type="datetime-local" required
              value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              style={inputStyle}
            />
            <input type="number" min="0" step="0.01" placeholder="Prix en FCFA (vide = gratuit)"
              value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
              style={inputStyle}
            />
            <button type="submit" disabled={saving}
              style={{ padding: "13px", backgroundColor: "#111", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4 }}>
              {saving ? "Création..." : "Créer l'événement"}
            </button>
          </form>
        )}

        {/* Liste */}
        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 60, color: "#999" }}>Chargement...</div>
        ) : events.length === 0 && !showForm ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <QrCode size={40} style={{ color: "#ccc", margin: "0 auto 12px" }} />
            <p style={{ color: "#999", fontSize: 14 }}>Aucun événement. Créez-en un !</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {events.map((event) => (
              <div key={event.id} style={{ backgroundColor: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center" }}>
                <Link href={`/admin/events/${event.id}`} style={{ flex: 1, minWidth: 0, textDecoration: "none" }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.name}</p>
                  <p style={{ fontSize: 12, color: "#888", margin: "3px 0 0" }}>
                    {new Date(event.date).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
                    {event.location && ` · ${event.location}`}
                    {event.price != null && ` · ${event.price.toLocaleString("fr-FR")} FCFA`}
                  </p>
                </Link>
                <div style={{ display: "flex", gap: 6, marginLeft: 10, flexShrink: 0 }}>
                  <button type="button" onClick={() => handleDelete(event.id)}
                    style={{ width: 40, height: 40, borderRadius: 10, border: "none", backgroundColor: "#fee2e2", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={15} />
                  </button>
                  <Link href={`/admin/events/${event.id}`}
                    style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                    <ChevronRight size={17} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bouton fixe en bas */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px 28px", backgroundColor: "#fff", borderTop: "1px solid #ebebeb", zIndex: 20 }}>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          style={{ width: "100%", padding: "15px", backgroundColor: showForm ? "#f8f8f8" : "#111", color: showForm ? "#111" : "#fff", border: showForm ? "1px solid #ddd" : "none", borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {showForm ? <><X size={17} /> Annuler</> : <><Plus size={17} /> Nouvel événement</>}
        </button>
      </div>

    </div>
  );
}
