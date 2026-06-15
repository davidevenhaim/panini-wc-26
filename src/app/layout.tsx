import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Cairo, Geist_Mono, Heebo, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { LOCALE_COOKIE, getLocaleDirection, isAppLocale, type AppLocale } from "@/constants/locale";
import { CONFIG } from "@/lib/app-config";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DirectionProvider } from "@/components/app/direction-provider";
import { ThemeProvider } from "@/components/app/theme-provider";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { ErrorBoundary } from "@/components/app/error-boundary";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  variable: "--font-heebo",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function localeFontClass(locale: AppLocale): string {
  if (locale === "he") return "locale-font-he";
  if (locale === "ar") return "locale-font-ar";
  return "locale-font-latin";
}

function fontVariableClasses(locale: AppLocale): string {
  const mono = geistMono.variable;
  if (locale === "he") return `${mono} ${heebo.variable}`;
  if (locale === "ar") return `${mono} ${cairo.variable}`;
  return `${mono} ${spaceGrotesk.variable} ${plusJakarta.variable}`;
}

const ogDescription =
  "Track your Panini FIFA World Cup 2026 sticker album. Manage 980 stickers, mark duplicates, and never miss a swap.";

export const metadata: Metadata = {
  metadataBase: new URL(CONFIG.siteUrl),
  title: "Panini WC 2026 Album Tracker",
  description: ogDescription,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Panini WC26", statusBarStyle: "default" },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Panini WC 2026 Album Tracker",
    description: ogDescription,
    type: "website",
    images: [{ url: "/logo.png", alt: "Panini WC 2026 Album Tracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Panini WC 2026 Album Tracker",
    description: ogDescription,
    images: ["/logo.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const messages = await getMessages();
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value ?? "en";
  const htmlLang: AppLocale = isAppLocale(raw) ? raw : "en";
  const htmlDir = getLocaleDirection(htmlLang);

  return (
    <html lang={htmlLang} dir={htmlDir}>
      <body className={`${fontVariableClasses(htmlLang)} ${localeFontClass(htmlLang)} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <DirectionProvider dir={htmlDir}>
            <ThemeProvider>
              <TooltipProvider>
                <ErrorBoundary>{children}</ErrorBoundary>
                <Toaster position={htmlDir === "rtl" ? "top-left" : "top-right"} />
                <LoadingIndicator variant="overlay" loadingKey="axios" />
              </TooltipProvider>
            </ThemeProvider>
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
