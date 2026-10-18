"use client";

import { motion } from "motion/react";
import type { Memo } from "@/lib/analysis";
import { useLanguage } from "@/lib/i18n";
import { revealItem } from "./reveal";

export function MemoBody({ memo }: { memo: Memo }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-10">
      <ListSection title={t.dossier.positives} items={memo.signaux_positifs} />
      <ListSection title={t.dossier.risks} items={memo.signaux_de_risque} />

      <motion.section variants={revealItem}>
        <SectionTitle>{t.dossier.verbatims}</SectionTitle>
        <div className="mt-4 flex flex-col gap-4" lang="fr">
          {memo.verbatims.map((quote) => (
            <blockquote key={quote} className="font-serif text-xl leading-relaxed italic">
              <span className="box-decoration-clone rounded-sm bg-amber/25 px-1">« {quote} »</span>
            </blockquote>
          ))}
        </div>
      </motion.section>

      <motion.section variants={revealItem}>
        <SectionTitle>{t.dossier.aiInsights}</SectionTitle>
        <p className="mt-3 text-[15px] leading-relaxed" lang="fr">{memo.enseignements_donnees_ia}</p>
      </motion.section>

      <ListSection title={t.dossier.toVerify} items={memo.points_a_verifier} />
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <motion.section variants={revealItem}>
      <SectionTitle>{title}</SectionTitle>
      <ul className="mt-3 flex flex-col gap-2" lang="fr">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-relaxed">
            <span className="mt-[0.6em] size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-sm font-medium text-muted-foreground">
      {children}
    </h2>
  );
}
