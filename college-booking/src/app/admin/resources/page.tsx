import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getUser";
import { getAdminResources } from "@/actions/admin";
import AppLayout from "@/components/AppLayout";
import AdminResourcesClient from "@/components/AdminResourcesClient";
import { User } from "@/types";

export default async function AdminResourcesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const resources = await getAdminResources();

  return (
    <AppLayout user={user as User}>
      <AdminResourcesClient resources={resources} />
    </AppLayout>
  );
}
