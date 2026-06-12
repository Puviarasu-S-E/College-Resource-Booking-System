import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getUser";
import { getAllBookings } from "@/actions/admin";
import AppLayout from "@/components/AppLayout";
import AdminBookingsClient from "@/components/AdminBookingsClient";
import { User } from "@/types";

export default async function AdminBookingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const bookings = await getAllBookings();

  return (
    <AppLayout user={user as User}>
      <AdminBookingsClient bookings={bookings} />
    </AppLayout>
  );
}
