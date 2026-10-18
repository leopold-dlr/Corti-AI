"use client";

import { motion } from "motion/react";
import { useLanguage } from "@/lib/i18n";
import { spring, tap } from "@/lib/motion";

export function AppHeader() {
  const { t, toggle } = useLanguage();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <span className="text-sm font-semibold tracking-tight">{t.appName}</span>
        <motion.button
          type="button"
          onClick={toggle}
          whileTap={tap}
          transition={spring}
          className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t.switchTo}
        </motion.button>
      </div>
    </header>
  );
}
