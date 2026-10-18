"use client";

import { motion } from "motion/react";
import { OrbView } from "@/components/OrbView";
import { PillButton } from "@/components/PillButton";
import { useLanguage } from "@/lib/i18n";
import { spring } from "@/lib/motion";

type EndedScreenProps = {
  conversationId: string;
  endedBy: "agent" | "user" | "error";
  onRestart: () => void;
};

// Étape 2 : écran provisoire. L'analyse (étape 3) et le dossier (étape 4) le remplaceront.
export function EndedScreen({ conversationId, endedBy, onRestart }: EndedScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 flex-col items-center px-5 pt-16 pb-8 text-center sm:px-8 sm:pt-20">
      <motion.div layoutId="orb" transition={spring} className="w-24">
        <OrbView still />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.1 }}
        className="flex flex-col items-center"
      >
        <h2 className="mt-6 text-2xl font-semibold tracking-tight">{t.callEnded}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {endedBy === "agent" ? t.endedByAgent : t.endedByUser}
        </p>
        <p className="mt-4 font-mono text-xs text-muted-foreground">{conversationId}</p>
        <PillButton className="mt-8" onClick={onRestart}>
          {t.newInterview}
        </PillButton>
      </motion.div>
    </div>
  );
}
