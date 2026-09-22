import type { Metadata, Viewport } from "next";
import { Poppins, Montserrat } from "next/font/google";
import { brand } from "@/lib/config/brand";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${brand.name} — Let's connect`,
  description: "Share your details and book a follow-up meeting with our team.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} ${montserrat.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
