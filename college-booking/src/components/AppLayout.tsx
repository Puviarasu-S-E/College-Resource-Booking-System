"use client";
import Navbar from "./Navbar";
import { User } from "@/types";

export default function AppLayout({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Navbar user={user} />
      <main className="page-content">{children}</main>
    </div>
  );
}
