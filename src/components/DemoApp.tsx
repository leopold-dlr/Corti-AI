"use client";

import { MotionConfig } from "motion/react";
import { ConversationProvider } from "@elevenlabs/react";
import { AppHeader } from "@/components/AppHeader";
import { InterviewFlow } from "@/components/InterviewFlow";
import { useLanguage } from "@/lib/i18n";

export function DemoApp() {
  const { t } = useLanguage();

  return (
    <ConversationProvider>
      <MotionConfig reducedMotion="user">
        <AppHeader />
        <main className="flex flex-1 flex-col">
          <InterviewFlow />
        </main>
        <footer className="px-5 pb-4 text-center text-xs text-muted-foreground sm:px-8 sm:pb-8">
          {t.disclaimer}
        </footer>
      </MotionConfig>
    </ConversationProvider>
  );
}
