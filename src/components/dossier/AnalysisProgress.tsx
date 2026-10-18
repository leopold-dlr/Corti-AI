"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { useLanguage } from "@/lib/i18n";
import { spring } from "@/lib/motion";

const STEP_INTERVAL_MS = 1400;

/**
 * Étapes de l'analyse, révélées une à une. L'API répond en un seul bloc :
 * les étapes avancent au rythme d'une minuterie, mais la dernière ne se coche
 * qu'à l'arrivée réelle du résultat.
 */
export function AnalysisProgress({ done }: { done: boolean }) {
  const { t } = useLanguage();
  const steps = t.dossier.steps;
  const [revealed, setRevealed] = useState(1);

  useEffect(() => {
    if (revealed >= steps.length) return;
    const id = window.setTimeout(() => setRevealed((n) => n + 1), STEP_INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [revealed, steps.length]);

  const visible = done ? steps.length : revealed;

  return (
    <ul className="flex flex-col gap-2.5 text-left" aria-live="polite">
      <AnimatePresence initial={false}>
        {steps.slice(0, visible).map((step, i) => {
          const checked = done || i < visible - 1;
          return (
            <motion.li
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="flex items-center gap-3 text-[15px]"
            >
              <span className="flex size-5 items-center justify-center">
                {checked ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={spring}
                    className="flex size-5 items-center justify-center rounded-full bg-foreground text-background"
                  >
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </motion.span>
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground" />
                )}
              </span>
              {checked ? (
                <span>{step}</span>
              ) : (
                <ShimmeringText text={step} duration={1.4} repeatDelay={0.3} />
              )}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
