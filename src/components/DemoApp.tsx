"use client";

import { MotionConfig } from "motion/react";
import { AppHeader } from "@/components/AppHeader";
import { HomeScreen } from "@/components/HomeScreen";
import { useLanguage } from "@/lib/i18n";

// Étape 1 : écran d'accueil seul. L'appel (étape 2) et le dossier (étape 4) viendront ici.
export function DemoApp() {
  const { t } = useLanguage();

  return (
    <MotionConfig reducedMotion="user">
      <AppHeader />
      <main className="flex flex-1 flex-col">
        <HomeScreen onStart={() => {}} />
      </main>
      <footer className="px-5 pb-8 text-center text-xs text-muted-foreground sm:px-8">
        {t.disclaimer}
      </footer>
    </MotionConfig>
  );
}
