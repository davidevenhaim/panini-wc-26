#!/usr/bin/env node
/* eslint-disable no-console -- CLI script: console is the user-facing channel. */
/**
 * pnpm reset — strip demo content from this skeleton so you can start your
 * own product on top of the infrastructure. Mirrors .claude/rules/reset.md.
 *
 * What it deletes:
 *   - /demo, /contact, /todos pages
 *   - contact + landing + todos features
 *   - demo + marketing components
 *   - demo + landing media constants
 *   - contact schema test
 *   - orphaned public/*.svg + lottie-demo
 *
 * What it keeps (load-bearing infrastructure):
 *   - auth-supabase feature + middleware + Supabase clients
 *   - login / signup pages, auth callback
 *   - api proxy, lib, hooks, utils, stores, types, i18n, form system, UI library
 *
 * What it rewrites:
 *   - src/app/page.tsx — minimal hero
 *   - src/constants/web-routes.constants.ts — only HOME + auth routes
 *   - src/constants/api-routes.constants.ts — CONTACT removed
 *   - all 4 locale files — demo/contact/todos keys removed
 *
 * After running: rm -rf .next && pnpm install && pnpm dev
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output, argv } from "node:process";

const root = process.cwd();
const force = argv.includes("--yes") || argv.includes("-y");

const dirsToDelete = [
  "src/app/demo",
  "src/app/contact",
  "src/app/todos",
  "src/app/api/proxy/contact",
  "src/components/demo",
  "src/components/marketing",
  "src/features/contact",
  "src/features/landing-page",
  "src/features/todos",
];

const filesToDelete = [
  "src/constants/demo-tabs.constants.ts",
  "src/constants/guide-sections.constants.ts",
  "src/constants/landing-media.constants.ts",
  "src/__tests__/contact.schema.test.ts",
  "public/lottie/lottie-demo.json",
  "public/file.svg",
  "public/globe.svg",
  "public/next.svg",
  "public/vercel.svg",
  "public/window.svg",
];

const demoTranslationKeys = [
  "demo",
  "contact",
  "todos",
  "tabGuide",
  "tabDashboard",
  "tabForms",
  "tabDialogs",
  "tabView",
  "tabTokenUsage",
  "tabTechnicalGuide",
  "tabLanding",
];

const homeKeysToRemove = ["githubProject", "showcasePage"];

const rootPageContent = `import { useTranslations } from "next-intl";
import { LocaleDialog } from "@/components/app";
import { HeroWithBackgroundImage } from "@/components/ui/hero-with-background-image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Typography } from "@/components/ui/typography";

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
        <div className="flex items-center justify-center gap-2">
          <ThemeToggle className="bg-background/80 border-border/60 border shadow-sm backdrop-blur" />
          <LocaleDialog />
        </div>
      </div>
    </HeroWithBackgroundImage>
  );
}
`;

const webRoutesContent = `const WEB_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  AUTH_CALLBACK: "/auth/callback",
  // add your own routes here
} as const;

export default WEB_ROUTES;
`;

const apiRoutesContent = `const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  // add your own routes here
} as const;

export default API_ROUTES;
`;

async function confirm(question) {
  if (force) return true;
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(`${question} [y/N] `);
  rl.close();
  return answer.trim().toLowerCase().startsWith("y");
}

function safeRm(target) {
  const abs = path.join(root, target);
  if (!fs.existsSync(abs)) return false;
  fs.rmSync(abs, { recursive: true, force: true });
  return true;
}

function pruneLocale(file) {
  const abs = path.join(root, "messages", file);
  if (!fs.existsSync(abs)) return;
  const obj = JSON.parse(fs.readFileSync(abs, "utf8"));
  for (const key of demoTranslationKeys) delete obj[key];
  if (obj.home && typeof obj.home === "object") {
    for (const k of homeKeysToRemove) delete obj.home[k];
  }
  fs.writeFileSync(abs, JSON.stringify(obj, null, 2) + "\n");
}

function writeFile(rel, content) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
}

async function main() {
  console.log("\nThis will remove demo content from the skeleton.\n");
  console.log("Delete:");
  for (const d of dirsToDelete) console.log("  " + d);
  for (const f of filesToDelete) console.log("  " + f);
  console.log("\nRewrite: src/app/page.tsx, web/api route constants, all 4 locale files\n");

  if (!(await confirm("Continue?"))) {
    console.log("Aborted.");
    process.exit(0);
  }

  let removed = 0;
  for (const d of dirsToDelete) if (safeRm(d)) removed++;
  for (const f of filesToDelete) if (safeRm(f)) removed++;

  writeFile("src/app/page.tsx", rootPageContent);
  writeFile("src/constants/web-routes.constants.ts", webRoutesContent);
  writeFile("src/constants/api-routes.constants.ts", apiRoutesContent);

  for (const file of ["en.json", "he.json", "es.json", "ar.json"]) pruneLocale(file);

  safeRm(".next");

  console.log(`\nDone. ${removed} item(s) deleted.`);
  console.log("Next: pnpm install (if needed), then pnpm dev.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
