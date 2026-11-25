import type { Metadata } from "next";
import { profile } from "@/data/profile";
import "./globals.css";
import "./artcraft-motion.css";

export const metadata: Metadata = {
  title: profile.meta.title,
  description: profile.meta.description,
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={{ ["--font-space-grotesk" as string]: "'Space Grotesk', sans-serif" }}
    >
      <body>{children}</body>
    </html>
  );
}
