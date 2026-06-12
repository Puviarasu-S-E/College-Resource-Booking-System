import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getUser";
import { getAdminDashboardStats } from "@/actions/admin";
import AppLayout from "@/components/AppLayout";
import { User } from "@/types";

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const stats = await getAdminDashboardStats();

  return (
    <AppLayout user={user as User}>
      <div className="stats-grid">
        <div className="stat-card blue"><h3>Total Resources</h3><p>{stats.totalResources}</p></div>
        <div className="stat-card"><h3>Total Bookings</h3><p>{stats.totalBookings}</p></div>
        <div className="stat-card yellow"><h3>Pending</h3><p>{stats.pending}</p></div>
        <div className="stat-card green"><h3>Approved</h3><p>{stats.approved}</p></div>
      </div>

      <div className="section-title">Recent Bookings</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>User</th><th>Resource</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {stats.recentBookings.map((b) => (
              <tr key={b.id}>
                <td>{b.user.name}</td>
                <td>{b.resource.name}</td>
                <td>{b.date.toLocaleDateString("en-GB")}</td>
                <td><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
              </tr>
            ))}
            {stats.recentBookings.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)" }}>No bookings yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
