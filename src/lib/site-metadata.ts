import type { Metadata } from "next";
import { SITE_METADATA } from "@/constants/site-metadata.constants";
import { CONFIG } from "@/lib/app-config";

type BuildSiteMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  /** When true, bypasses the root title template (e.g. share pages). */
  absoluteTitle?: boolean;
};

export function buildSiteMetadata({
  title,
  description,
  path = "/",
  absoluteTitle = false,
}: BuildSiteMetadataOptions): Metadata {
  const canonicalUrl = new URL(path, CONFIG.siteUrl).toString();

  return {
    metadataBase: new URL(CONFIG.siteUrl),
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: canonicalUrl },
    manifest: SITE_METADATA.manifestPath,
    themeColor: SITE_METADATA.themeColor,
    appleWebApp: {
      capable: true,
      title: CONFIG.appName || "Panini WC26",
      statusBarStyle: "default",
    },
    icons: {
      icon: [
        { url: SITE_METADATA.icons.favicon },
        {
          url: SITE_METADATA.icons.favicon16,
          sizes: "16x16",
          type: "image/png",
        },
        {
          url: SITE_METADATA.icons.favicon32,
          sizes: "32x32",
          type: "image/png",
        },
      ],
      apple: SITE_METADATA.icons.appleTouch,
      other: [
        {
          rel: "android-chrome-192x192",
          url: SITE_METADATA.icons.android192,
        },
        {
          rel: "android-chrome-512x512",
          url: SITE_METADATA.icons.android512,
        },
      ],
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      siteName: CONFIG.appName || "Panini WC 2026 Album Tracker",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
