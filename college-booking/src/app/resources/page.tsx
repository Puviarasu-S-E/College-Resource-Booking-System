import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getUser";
import { getResources } from "@/actions/resources";
import AppLayout from "@/components/AppLayout";
import ResourcesClient from "@/components/ResourcesClient";
import { User } from "@/types";

export default async function ResourcesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resources = await getResources();

  return (
    <AppLayout user={user as User}>
      <ResourcesClient resources={resources} />
    </AppLayout>
  );
}
