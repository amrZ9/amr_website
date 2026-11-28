import type { Metadata } from "next";
import Script from "next/script";
import { profile } from "@/data/profile";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
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
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
