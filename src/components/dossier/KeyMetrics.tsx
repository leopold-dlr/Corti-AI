"use client";

import type { AnalysisResult } from "@/lib/analysis";
import { formatValue, toNumber } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";
import { fieldLabels } from "@/lib/labels";
import { AnimatedNumber } from "./AnimatedNumber";

export function KeyMetrics({ result }: { result: AnalysisResult }) {
  const { t, lang } = useLanguage();
  const { data, completeness } = result;
  const satisfaction = toNumber(data.score_satisfaction);
  const recommendation = toNumber(data.score_recommandation);

  return (
    <section aria-labelledby="key-metrics">
      <h2 id="key-metrics" className="text-sm font-medium text-muted-foreground">
        {t.dossier.keyMetrics}
      </h2>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-5">
        <Score label={t.dossier.satisfaction} value={satisfaction} />
        <Score label={t.dossier.recommendation} value={recommendation} />
        <Text label={t.dossier.priceReaction} value={formatValue(data.reaction_hausse_prix, t)} />
        <Text label={t.dossier.renewal} value={formatValue(data.intention_renouvellement, t)} />

        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">{t.dossier.completeness}</dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight">
              <AnimatedNumber value={Math.round(completeness.rate * 100)} suffix="%" />
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {completeness.filled}/{completeness.total}
            </span>
          </dd>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-foreground"
              style={{ width: `${completeness.rate * 100}%` }}
            />
          </div>
          {completeness.missing.length > 0 ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t.dossier.missing} {completeness.missing.map((field) => fieldLabels[field][lang]).join(", ")}
            </p>
          ) : null}
        </div>
      </dl>
    </section>
  );
}

function Score({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-4xl font-semibold tracking-tight">
        {value === null ? (
          "—"
        ) : (
          <>
            <AnimatedNumber value={value} decimals={Number.isInteger(value) ? 0 : 1} />
            <span className="text-lg text-muted-foreground">/10</span>
          </>
        )}
      </dd>
    </div>
  );
}

function Text({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-medium leading-snug">{value}</dd>
    </div>
  );
}
