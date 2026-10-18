"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { OrbView } from "@/components/OrbView";
import { PillButton } from "@/components/PillButton";
import { AnalysisProgress } from "@/components/dossier/AnalysisProgress";
import { Dossier } from "@/components/dossier/Dossier";
import { useLanguage } from "@/lib/i18n";
import { spring } from "@/lib/motion";
import { useAnalysis } from "@/lib/useAnalysis";

// Laisse voir la dernière étape se cocher avant de révéler le dossier
const REVEAL_DELAY_MS = 700;

type EndedScreenProps = {
  conversationId: string;
  endedBy: "agent" | "user" | "error";
  onRestart: () => void;
};

export function EndedScreen({ conversationId, endedBy, onRestart }: EndedScreenProps) {
  const { t } = useLanguage();
  const { state, retry } = useAnalysis(conversationId);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (state.status !== "success") return;
    const id = window.setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [state.status]);

  if (state.status === "success" && revealed) {
    return <Dossier result={state.result} onRestart={onRestart} />;
  }

  return (
    <div className="flex flex-1 flex-col items-center px-5 pt-16 pb-8 text-center sm:px-8 sm:pt-20">
      <motion.div layoutId="orb" transition={spring} className="w-28">
        <OrbView agentState="thinking" still={state.status === "error"} />
      </motion.div>

      <p className="mt-4 text-sm text-muted-foreground">
        {endedBy === "agent" ? t.endedByAgent : t.endedByUser}
      </p>

      <div className="mt-8 min-h-32">
        {state.status === "error" ? (
          <div className="flex flex-col items-center gap-4">
            <p role="alert" className="max-w-md text-sm text-fail">
              {t.analysisErrors[state.code]}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <PillButton onClick={retry}>{t.retryAnalysis}</PillButton>
              <PillButton variant="secondary" onClick={onRestart}>
                {t.newInterview}
              </PillButton>
            </div>
          </div>
        ) : (
          <AnalysisProgress done={state.status === "success"} />
        )}
      </div>
    </div>
  );
}
