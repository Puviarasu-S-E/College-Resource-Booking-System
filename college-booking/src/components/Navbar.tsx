"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/types";

const userLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resources", label: "Resources" },
  { href: "/bookings", label: "My Bookings" },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/bookings", label: "All Bookings" },
];

export default function Navbar({ user }: { user: User }) {
  const pathname = usePathname();
  const links = user.role === "ADMIN" ? adminLinks : userLinks;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo">Campus<span>Reserve</span></div>
      <div className="navbar-links">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
            {l.label}
          </Link>
        ))}
      </div>
      <div className="navbar-right">
        <span className="user-name">{user.name}</span>
        <span className="role-badge">{user.role}</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
