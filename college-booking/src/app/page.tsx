import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getUser";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}
