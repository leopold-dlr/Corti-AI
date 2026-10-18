"use client";

import { motion, useReducedMotion } from "motion/react";
import { OrbView } from "@/components/OrbView";
import { PillButton } from "@/components/PillButton";
import { useLanguage } from "@/lib/i18n";
import { softSpring, spring } from "@/lib/motion";

type HomeScreenProps = {
  onStart: () => void;
  error?: string | null;
};

export function HomeScreen({ onStart, error }: HomeScreenProps) {
  const { t, lang } = useLanguage();
  const reducedMotion = useReducedMotion();
  const words = t.title.split(" ");
  // L'Orb arrive juste après le dernier mot du titre
  const orbDelay = reducedMotion ? 0 : 0.25 + words.length * 0.08;

  return (
    <div className="flex flex-1 flex-col items-center px-5 pt-10 pb-10 text-center sm:px-8 sm:pt-24">
      <h1 className="text-5xl font-semibold tracking-[-0.045em] sm:text-7xl lg:text-8xl">
        {words.map((word, i) => (
          <motion.span
            key={`${lang}-${i}`}
            className="inline-block whitespace-pre"
            initial={reducedMotion ? false : { opacity: 0, filter: "blur(10px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ ...spring, delay: 0.1 + i * 0.08 }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </h1>

      <p className="mt-6 max-w-xl text-base leading-relaxed text-pretty">{t.pitch}</p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
        {t.roleplay}
      </p>

      <motion.div
        layoutId="orb"
        className="mt-8 w-[min(64vw,300px)] sm:mt-10"
        initial={reducedMotion ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...softSpring, delay: orbDelay }}
      >
        <OrbView />
      </motion.div>

      <PillButton className="mt-8" onClick={onStart}>
        {t.start}
      </PillButton>

      {error ? (
        <p role="alert" className="mt-4 max-w-md text-sm text-fail">
          {error}
        </p>
      ) : null}

      <ol className="mt-auto flex flex-col gap-1 pt-16 text-xs text-muted-foreground sm:flex-row sm:gap-0">
        {t.steps.map((step, i) => (
          <li key={step} className="sm:after:mx-3 sm:after:content-['—'] sm:last:after:content-none">
            <span className="tabular-nums">{i + 1}.</span> {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
