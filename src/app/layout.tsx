import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PerfectTraderProvider } from "@/lib/context";
import { APP_NAME, APP_NAME_SHORT } from "@/lib/brand";
import ToastContainer from "@/components/Toast";
import CookieConsent from "@/components/CookieConsent";
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
        <div className="min-h-screen bg-gray-950 flex justify-center">
          <div className="w-full max-w-[390px] min-h-screen relative bg-white shadow-2xl overflow-hidden">
            <PerfectTraderProvider initialUser={initialUser} initialAuthUserId={initialAuthUserId}>
              <TrackingProvider initialAuthUserId={initialAuthUserId}>
                {children}
                <ToastContainer />
                <CookieConsent />
              </TrackingProvider>
            </PerfectTraderProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
