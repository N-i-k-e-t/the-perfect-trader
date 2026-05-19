import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PerfectTraderProvider } from "@/lib/context";
import { APP_NAME, APP_NAME_SHORT } from "@/lib/brand";
import ToastContainer from "@/components/Toast";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: `${APP_NAME} — Ambient Trading Discipline`,
  description: 'Proactive habit architecture for modern traders.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME_SHORT,
  },
  manifest: '/manifest.json',
  icons: {
    apple: '/icon-192.png',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': APP_NAME_SHORT,
    'theme-color': '#ffffff',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#1a1a2e] text-white antialiased min-h-[100dvh] overflow-x-hidden`}>
        <PerfectTraderProvider>
          {children}
          <ToastContainer />
        </PerfectTraderProvider>
      </body>
    </html>
  );
}
