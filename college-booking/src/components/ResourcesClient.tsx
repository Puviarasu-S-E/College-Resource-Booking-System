"use client";
import { useState } from "react";
import { Resource } from "@/types";
import { gqlRequest } from "@/lib/gqlClient";

const CREATE_BOOKING = `
  mutation($resourceId: ID!, $date: String!, $startTime: String!, $endTime: String!) {
    createBooking(resourceId: $resourceId, date: $date, startTime: $startTime, endTime: $endTime) { id }
  }
`;

const GET_BOOKED_SLOTS = `
  query($resourceId: ID!, $date: String!) {
    bookedSlots(resourceId: $resourceId, date: $date) { startTime endTime }
  }
`;

// Today's date in YYYY-MM-DD format (used as min date for the date picker)
const today = new Date().toISOString().split("T")[0];

export default function ResourcesClient({ resources }: { resources: Resource[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Resource | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<{ startTime: string; endTime: string }[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Get unique categories for the filter buttons
  const categories = [...new Set(resources.map((r) => r.category))];

  // Filter resources by search text and selected category
  const filtered = resources.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || r.category === category;
    return matchesSearch && matchesCategory;
  });

  // When date changes, fetch already-booked slots for this resource
  async function onDateChange(newDate: string) {
    setDate(newDate);
    setStartTime("");
    setEndTime("");
    setError("");
    if (!newDate || !selected) return;
    const data = await gqlRequest<{ bookedSlots: { startTime: string; endTime: string }[] }>(GET_BOOKED_SLOTS, {
      resourceId: selected.id,
      date: newDate,
    });
    setBookedSlots(data.bookedSlots);
  }

  // Submit booking
  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (startTime >= endTime) { setError("End time must be after start time."); return; }
    setLoading(true);
    setError("");
    try {
      await gqlRequest(CREATE_BOOKING, { resourceId: selected!.id, date, startTime, endTime });
      setSuccess("Booking created! Awaiting approval.");
      setTimeout(() => { setSelected(null); setSuccess(""); }, 1500);
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  }

  // Open the booking modal for a resource
  function openModal(r: Resource) {
    setSelected(r);
    setDate("");
    setStartTime("");
    setEndTime("");
    setBookedSlots([]);
    setError("");
    setSuccess("");
  }

  return (
    <>
      <div className="page-header"><h1>Available Resources</h1></div>

      {/* Search bar */}
      <div className="search-bar">
        <input placeholder="Search by name or category…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Category filter buttons */}
      <div className="filter-bar">
        <button className={`filter-pill${!category ? " active" : ""}`} onClick={() => setCategory("")}>All</button>
        {categories.map((c) => (
          <button key={c} className={`filter-pill${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {/* Resource cards */}
      {filtered.length === 0 ? (
        <div className="empty-state">No resources found.</div>
      ) : (
        <div className="resources-grid">
          {filtered.map((r) => (
            <div key={r.id} className="resource-card">
              <span className="category">{r.category}</span>
              <h3>{r.name}</h3>
              <p>{r.description}</p>
              <div className="resource-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => openModal(r)}>Book</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Book: {selected.name}</h2>
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}
            <form onSubmit={handleBook}>

              <div className="form-group">
                <label>Date</label>
                <input type="date" required min={today} value={date} onChange={(e) => onDateChange(e.target.value)} />
              </div>

              {/* Show already-booked slots for the selected date */}
              {date && bookedSlots.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Already booked</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {bookedSlots.map((slot, i) => (
                      <span key={i} style={{ fontSize: 12, padding: "3px 10px", background: "#fee2e2", color: "#9f1239", borderRadius: 20, fontWeight: 500 }}>
                        {slot.startTime} – {slot.endTime}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Start Time</label>
                <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>

              <div className="form-group">
                <label>End Time</label>
                <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading || !date}>
                  {loading ? "Booking…" : "Confirm"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
