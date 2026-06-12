"use client";
import { useState } from "react";
import { Booking } from "@/types";
import { gqlRequest } from "@/lib/gqlClient";

const CANCEL_BOOKING = `
  mutation($bookingId: ID!) {
    cancelBooking(bookingId: $bookingId) { id status }
  }
`;

export default function BookingsClient({ bookings: initial }: { bookings: Booking[] }) {
  const [bookings, setBookings] = useState(initial);
  const [statusFilter, setStatusFilter] = useState("");

  // Only show bookings matching the selected status filter
  const filtered = statusFilter ? bookings.filter((b) => b.status === statusFilter) : bookings;

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    await gqlRequest(CANCEL_BOOKING, { bookingId: id });
    // Update the cancelled booking's status in the list
    setBookings(bookings.map((b) => b.id === id ? { ...b, status: "REJECTED" } : b));
  }

  return (
    <>
      <div className="page-header"><h1>My Bookings</h1></div>

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
              <tr>
                <th>Resource</th>
                <th>Category</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>{b.resource.name}</td>
                  <td>{b.resource.category}</td>
                  <td>{new Date(b.date).toLocaleDateString("en-GB")}</td>
                  <td>{b.startTime} – {b.endTime}</td>
                  <td>
                    <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                    {/* Show rejection reason if available */}
                    {b.status === "REJECTED" && b.rejectionReason && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        Reason: {b.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>
                    {b.status === "PENDING" && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>Cancel</button>
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
