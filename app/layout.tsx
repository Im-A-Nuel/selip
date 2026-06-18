import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { InstallPrompt } from "@/components/InstallPrompt";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: "Selip - Slip someone a gift",
  description: "Slip someone a gift. No wallet needed.",
  appleWebApp: { capable: true, title: "Selip", statusBarStyle: "default" },
  openGraph: {
    title: "Selip - Slip someone a gift",
    description: "Give a gift, as easy as a text. No wallet needed.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Selip - Slip someone a gift",
    description: "Give a gift, as easy as a text. No wallet needed.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#fdf7f3",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <div className="aurora" aria-hidden />
        <ToastProvider>{children}</ToastProvider>
        <InstallPrompt />
      </body>
    </html>
  );
}
