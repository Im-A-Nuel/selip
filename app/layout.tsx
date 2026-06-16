import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Selip",
  description: "Slip someone a gift. No wallet needed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
