import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusReserve",
  description: "Resource booking and allocation for your campus",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
