const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Event = {
  id: string;
  name: string;
  description?: string;
  date: string;
  location?: string;
  price?: number;
  created_at: string;
};

export type Ticket = {
  id: string;
  event_id: string;
  person_name: string;
  phone?: string;
  email?: string;
  qr_code_id: string;
  is_used: boolean;
  scanned_at?: string;
  created_at: string;
};

export type ScanResult = {
  valid: boolean;
  message: string;
  ticket: Ticket;
};

// Events
export async function getEvents(): Promise<Event[]> {
  const res = await fetch(`${API}/events`);
  if (!res.ok) throw new Error("Erreur chargement événements");
  return res.json();
}

export async function getEvent(id: string): Promise<Event> {
  const res = await fetch(`${API}/events/${id}`);
  if (!res.ok) throw new Error("Événement introuvable");
  return res.json();
}

export async function createEvent(data: {
  name: string;
  description?: string;
  date: string;
  location?: string;
  price?: number;
}): Promise<Event> {
  const res = await fetch(`${API}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur création événement");
  return res.json();
}

export async function deleteEvent(id: string): Promise<void> {
  await fetch(`${API}/events/${id}`, { method: "DELETE" });
}

// Tickets
export async function getTickets(): Promise<Ticket[]> {
  const res = await fetch(`${API}/tickets`);
  if (!res.ok) throw new Error("Erreur chargement tickets");
  return res.json();
}

export async function getTicket(id: string): Promise<Ticket> {
  const res = await fetch(`${API}/tickets/${id}`);
  if (!res.ok) throw new Error("Ticket introuvable");
  return res.json();
}

export async function createTicket(data: {
  event_id: string;
  person_name: string;
  phone?: string;
  email?: string;
}): Promise<Ticket> {
  const res = await fetch(`${API}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur création ticket");
  return res.json();
}

export async function scanTicket(qrCodeId: string): Promise<ScanResult> {
  const res = await fetch(`${API}/tickets/${qrCodeId}/scan`, { method: "POST" });
  if (!res.ok) throw new Error("Ticket invalide");
  return res.json();
}

export function ticketImageUrl(ticketId: string): string {
  return `${API}/tickets/${ticketId}/image`;
}

export function ticketQrUrl(ticketId: string): string {
  return `${API}/tickets/${ticketId}/qr`;
}
