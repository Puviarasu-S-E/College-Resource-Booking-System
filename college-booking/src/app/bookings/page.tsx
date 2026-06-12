import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getUser";
import { getUserBookings } from "@/actions/bookings";
import AppLayout from "@/components/AppLayout";
import BookingsClient from "@/components/BookingsClient";
import { User } from "@/types";

export default async function BookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const bookings = await getUserBookings(user.id);

  return (
    <AppLayout user={user as User}>
      <BookingsClient bookings={bookings} />
    </AppLayout>
  );
}
