import Link from "next/link";
import { useTranslations } from "next-intl";
import { LocaleDialog } from "@/components/app";
import { Button } from "@/components/ui/button";
import { HeroWithBackgroundImage } from "@/components/ui/hero-with-background-image";
import Iconify from "@/components/ui/iconify";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Typography } from "@/components/ui/typography";
import { GITHUB_URL } from "@/constants/app.constants";
import WEB_ROUTES from "@/constants/web-routes.constants";

export default function RootPage() {
  const t = useTranslations();

  return (
    <HeroWithBackgroundImage
      backgroundImageSrc="/landing-page/globe.png"
      backgroundImageSrcLight="/landing-page/globe-light.png"
      backgroundImageAlt=""
      imagePosition="center 75%"
      contentClassName="mx-auto max-w-4xl"
    >
      <div className="flex flex-col items-center gap-6">
        <Typography variant="h1" className="text-center text-4xl font-bold md:text-6xl">
          {t("home.startHere")}
        </Typography>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button asChild variant="outline">
            <Link href={GITHUB_URL} target="_blank" rel="noreferrer">
              <Iconify icon="lucide:github" className="size-4" />
              {t("home.githubProject")}
            </Link>
          </Button>
          <Button asChild>
            <Link href={WEB_ROUTES.DEMO_GUIDE}>
              <Iconify icon="lucide:sparkles" className="size-4" />
              {t("home.showcasePage")}
            </Link>
          </Button>
          <ThemeToggle className="bg-background/80 border-border/60 border shadow-sm backdrop-blur" />
          <LocaleDialog />
        </div>
      </div>
    </HeroWithBackgroundImage>
  );
}
