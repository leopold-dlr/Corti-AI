"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { TriangleAlert } from "lucide-react";
import { OrbView } from "@/components/OrbView";
import { PillButton } from "@/components/PillButton";
import type { AnalysisResult } from "@/lib/analysis";
import { formatDate, formatDuration } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";
import { memoToText } from "@/lib/memoText";
import { spring } from "@/lib/motion";
import { FieldsTable } from "./FieldsTable";
import { KeyMetrics } from "./KeyMetrics";
import { MemoBody } from "./MemoBody";
import { QualityControl } from "./QualityControl";
import { revealContainer, revealItem } from "./reveal";

type DossierProps = {
  result: AnalysisResult;
  onRestart: () => void;
};

export function Dossier({ result, onRestart }: DossierProps) {
  const { t, lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const meta = [formatDuration(result.durationSecs), formatDate(result.startedAt, lang)]
    .filter(Boolean)
    .join(" · ");

  async function copyMemo() {
    try {
      await navigator.clipboard.writeText(memoToText(result, t));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("[clipboard]", error);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-12 sm:px-8 sm:pt-14">
      <header className="flex items-center gap-4">
        <motion.div layoutId="orb" transition={spring} className="w-12 shrink-0">
          <OrbView still />
        </motion.div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.dossier.title}</h1>
          {meta ? <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">{meta}</p> : null}
        </div>
      </header>

      <motion.div variants={revealContainer} initial="hidden" animate="visible">
        {result.data.alerte_confidentialite === true ? (
          <motion.div
            variants={revealItem}
            role="alert"
            className="mt-8 flex items-start gap-3 rounded-2xl bg-amber/20 px-5 py-4 text-[15px] font-medium text-foreground ring-1 ring-amber/50"
          >
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber" aria-hidden />
            {t.dossier.confidentialityAlert}
          </motion.div>
        ) : null}

        <motion.section variants={revealItem} className="mt-10 max-w-3xl">
          <p lang="fr" className="font-serif text-[22px] leading-snug text-pretty sm:text-[28px]">
            {result.memo.synthese}
          </p>
          {lang === "en" ? (
            <p className="mt-3 text-xs text-muted-foreground">{t.dossier.memoLanguage}</p>
          ) : null}
        </motion.section>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
          <MemoBody memo={result.memo} />

          <aside className="flex flex-col gap-10 lg:sticky lg:top-20 lg:self-start lg:border-l lg:border-border lg:pl-10">
            <motion.div variants={revealItem}>
              <KeyMetrics result={result} />
            </motion.div>
            <motion.div variants={revealItem}>
              <QualityControl criteria={result.criteria} />
            </motion.div>
          </aside>
        </div>

        <motion.div variants={revealItem} className="mt-14">
          <FieldsTable data={result.data} />
        </motion.div>

        <motion.div variants={revealItem} className="mt-10 flex flex-wrap gap-3">
          <PillButton onClick={copyMemo}>{copied ? t.dossier.copied : t.copyNote}</PillButton>
          <PillButton variant="secondary" onClick={onRestart}>
            {t.newInterview}
          </PillButton>
        </motion.div>
      </motion.div>
    </div>
  );
}
