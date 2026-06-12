"use client";
import { useState } from "react";
import { Booking } from "@/types";
import { gqlRequest } from "@/lib/gqlClient";

const APPROVE_BOOKING = `
  mutation($bookingId: ID!) {
    approveBooking(bookingId: $bookingId) { id status }
  }
`;

const REJECT_BOOKING = `
  mutation($bookingId: ID!, $reason: String!) {
    rejectBooking(bookingId: $bookingId, reason: $reason) { id status rejectionReason }
  }
`;

export default function AdminBookingsClient({ bookings: initial }: { bookings: Booking[] }) {
  const [bookings, setBookings] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null); // stores the id of the booking being acted on
  const [rejectingId, setRejectingId] = useState<string | null>(null); // stores id of booking being rejected
  const [reason, setReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = statusFilter ? bookings.filter((b) => b.status === statusFilter) : bookings;

  async function approve(id: string) {
    setLoading(id);
    const data = await gqlRequest<{ approveBooking: { id: string; status: string } }>(APPROVE_BOOKING, { bookingId: id });
    setBookings(bookings.map((b) => b.id === data.approveBooking.id ? { ...b, status: "APPROVED" } : b));
    setLoading(null);
  }

  async function reject(id: string) {
    if (!reason.trim()) return;
    setLoading(id);
    const data = await gqlRequest<{ rejectBooking: { id: string; status: string; rejectionReason: string } }>(REJECT_BOOKING, { bookingId: id, reason });
    setBookings(bookings.map((b) => b.id === data.rejectBooking.id ? { ...b, status: "REJECTED", rejectionReason: data.rejectBooking.rejectionReason } : b));
    setLoading(null);
    setRejectingId(null);
    setReason("");
  }

  return (
    <>
      <div className="page-header"><h1>All Bookings</h1></div>

      {/* Status filter buttons */}
      <div className="filter-bar">
        {["All", "PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            className={`filter-pill${statusFilter === (s === "All" ? "" : s) ? " active" : ""}`}
            onClick={() => setStatusFilter(s === "All" ? "" : s)}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No bookings found.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>User</th><th>Resource</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div>{b.user.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{b.user.email}</div>
                  </td>
                  <td>{b.resource.name}</td>
                  <td>{new Date(b.date).toLocaleDateString("en-GB")}</td>
                  <td>{b.startTime} – {b.endTime}</td>
                  <td>
                    <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                    {b.status === "REJECTED" && b.rejectionReason && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        Reason: {b.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>
                    {/* Approve / Reject buttons for pending bookings */}
                    {b.status === "PENDING" && rejectingId !== b.id && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-success btn-sm" disabled={loading === b.id} onClick={() => approve(b.id)}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => { setRejectingId(b.id); setReason(""); }}>Reject</button>
                      </div>
                    )}
                    {/* Rejection reason input */}
                    {rejectingId === b.id && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <input
                          placeholder="Reason for rejection"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          style={{ padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13 }}
                        />
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-danger btn-sm" disabled={!reason.trim() || loading === b.id} onClick={() => reject(b.id)}>Confirm</button>
                          <button className="btn btn-outline btn-sm" onClick={() => { setRejectingId(null); setReason(""); }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
