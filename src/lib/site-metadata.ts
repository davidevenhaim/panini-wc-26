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
      icon: SITE_METADATA.logoPath,
      apple: SITE_METADATA.logoPath,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      siteName: CONFIG.appName || "Panini WC 2026 Album Tracker",
      locale: "en_US",
      images: [
        {
          url: SITE_METADATA.ogShareImagePath,
          width: SITE_METADATA.ogShareImageWidth,
          height: SITE_METADATA.ogShareImageHeight,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SITE_METADATA.ogShareImagePath],
    },
  };
}
