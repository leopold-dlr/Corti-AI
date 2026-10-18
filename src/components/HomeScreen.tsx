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
    // Tient dans la hauteur de l'écran (moins l'en-tête et le pied de page) : l'Orb prend la place restante
    <div className="flex h-[calc(100svh-7rem)] min-h-min flex-col items-center px-5 pt-[clamp(1.5rem,5svh,6rem)] pb-4 text-center sm:px-8">
      <h1 className="text-5xl leading-none font-semibold tracking-[-0.045em] sm:text-[clamp(3rem,10svh,4.5rem)] lg:text-[clamp(3rem,10svh,6rem)]">
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

      <p className="mt-4 max-w-xl text-base leading-relaxed text-pretty sm:mt-6">{t.pitch}</p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
        {t.roleplay}
      </p>

      <div className="flex min-h-min w-full flex-1 items-center justify-center py-[clamp(0.5rem,3svh,2.5rem)]">
        <motion.div
          layoutId="orb"
          className="aspect-square h-full min-h-20 max-h-[min(64vw,300px)]"
          initial={reducedMotion ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...softSpring, delay: orbDelay }}
        >
          <OrbView className="h-full" />
        </motion.div>
      </div>

      <PillButton className="shrink-0" onClick={onStart}>
        {t.start}
      </PillButton>

      {error ? (
        <p role="alert" className="mt-4 max-w-md text-sm text-fail">
          {error}
        </p>
      ) : null}

      <ol className="mt-[clamp(0.75rem,5svh,3rem)] hidden text-xs text-muted-foreground sm:flex">
        {t.steps.map((step, i) => (
          <li key={step} className="sm:after:mx-3 sm:after:content-['—'] sm:last:after:content-none">
            <span className="tabular-nums">{i + 1}.</span> {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
