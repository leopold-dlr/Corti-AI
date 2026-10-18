"use client";

import { motion } from "motion/react";
import { OrbView } from "@/components/OrbView";
import { PillButton } from "@/components/PillButton";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { useLanguage } from "@/lib/i18n";
import { spring } from "@/lib/motion";
import { useAnalysis } from "@/lib/useAnalysis";

type EndedScreenProps = {
  conversationId: string;
  endedBy: "agent" | "user" | "error";
  onRestart: () => void;
};

// Étape 3 : analyse branchée, affichage minimal. Le dossier complet arrive à l'étape 4.
export function EndedScreen({ conversationId, endedBy, onRestart }: EndedScreenProps) {
  const { t } = useLanguage();
  const { state, retry } = useAnalysis(conversationId);

  return (
    <div className="flex flex-1 flex-col items-center px-5 pt-16 pb-8 text-center sm:px-8 sm:pt-20">
      <motion.div layoutId="orb" transition={spring} className="w-24">
        <OrbView agentState={state.status === "loading" ? "thinking" : null} still={state.status !== "loading"} />
      </motion.div>

      <p className="mt-4 text-sm text-muted-foreground">
        {endedBy === "agent" ? t.endedByAgent : t.endedByUser}
      </p>

      <div className="mt-6 min-h-24" aria-live="polite">
        {state.status === "loading" ? (
          <ShimmeringText text={t.analysing} className="text-lg font-medium" duration={1.6} />
        ) : null}

        {state.status === "error" ? (
          <div className="flex flex-col items-center gap-4">
            <p role="alert" className="max-w-md text-sm text-fail">
              {t.analysisErrors[state.code]}
            </p>
            <PillButton variant="secondary" onClick={retry}>
              {t.retryAnalysis}
            </PillButton>
          </div>
        ) : null}

        {state.status === "success" ? (
          <pre className="max-w-xl overflow-x-auto rounded-xl bg-secondary p-4 text-left font-mono text-xs">
            {JSON.stringify(
              {
                durationSecs: state.result.durationSecs,
                completeness: state.result.completeness,
                criteria: `${state.result.criteria.filter((c) => c.result === "success").length}/${state.result.criteria.length}`,
                synthese: state.result.memo.synthese,
              },
              null,
              2,
            )}
          </pre>
        ) : null}
      </div>

      <PillButton className="mt-8" onClick={onRestart}>
        {t.newInterview}
      </PillButton>
    </div>
  );
}
