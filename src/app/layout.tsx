import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PerfectTraderProvider } from "@/lib/context";
import { APP_NAME, APP_NAME_SHORT } from "@/lib/brand";
import { SITE_URL } from "@/lib/config";
import ToastContainer from "@/components/Toast";
import CookieConsent from "@/components/CookieConsent";
import ViewportShell from "@/components/layout/ViewportShell";
import TrackingProvider from "@/components/analytics/TrackingProvider";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase-data";
import { userFromSupabaseAuthUser } from "@/lib/auth-user";
import type { User } from "@/types/trading";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1a1a2e',
};

export const metadata: Metadata = {
  title: `${APP_NAME} — Ambient Trading Discipline`,
  description: 'Trade your plan. Every session. Rules, grades, AI coach.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: APP_NAME,
    description: 'Trade your plan. Every session. Rules, grades, AI coach.',
    url: SITE_URL,
    siteName: APP_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: 'Trade your plan. Every session.',
    creator: '@ThePerfectTrader',
  },
  alternates: {
    canonical: SITE_URL,
  },
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialUser: User | null = null;
  let initialAuthUserId: string | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      initialUser = userFromSupabaseAuthUser(authUser);
      initialAuthUserId = authUser.id;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-[100dvh] overflow-x-hidden`}>
        <PerfectTraderProvider initialUser={initialUser} initialAuthUserId={initialAuthUserId}>
          <TrackingProvider initialAuthUserId={initialAuthUserId}>
            <ViewportShell>{children}</ViewportShell>
            <ToastContainer />
            <CookieConsent />
          </TrackingProvider>
        </PerfectTraderProvider>
      </body>
    </html>
  );
}
