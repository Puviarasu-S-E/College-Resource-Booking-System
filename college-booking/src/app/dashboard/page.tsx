import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getUser";
import { getDashboardStats } from "@/actions/dashboard";
import AppLayout from "@/components/AppLayout";
import { User } from "@/types";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const stats = await getDashboardStats(user.id);

  return (
    <AppLayout user={user as User}>
      <div className="stats-grid">
        <div className="stat-card blue">
          <h3>Total Bookings</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card yellow">
          <h3>Pending</h3>
          <p>{stats.pending}</p>
        </div>
        <div className="stat-card green">
          <h3>Approved</h3>
          <p>{stats.approved}</p>
        </div>
        <div className="stat-card">
          <h3>Available Resources</h3>
          <p>{stats.resourceCount}</p>
        </div>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        Browse <a href="/resources" style={{ color: "var(--primary)" }}>resources</a> to make a new booking, or check your{" "}
        <a href="/bookings" style={{ color: "var(--primary)" }}>booking history</a>.
      </p>
    </AppLayout>
  );
}
