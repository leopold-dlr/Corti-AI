"use client";

import type { CriterionResult } from "@/lib/analysis";
import { useLanguage } from "@/lib/i18n";
import { criterionLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Collapsible } from "./Collapsible";

const dotClasses: Record<CriterionResult["result"], string> = {
  success: "bg-pass",
  failure: "bg-fail",
  unknown: "bg-muted-foreground/40",
};

export function QualityControl({ criteria }: { criteria: CriterionResult[] }) {
  const { t, lang } = useLanguage();
  const passed = criteria.filter((c) => c.result === "success").length;
  const statusLabel = { success: t.dossier.pass, failure: t.dossier.fail, unknown: t.dossier.unknown };

  return (
    <section aria-labelledby="quality">
      <h2 id="quality" className="text-sm font-medium text-muted-foreground">
        {t.dossier.quality}
      </h2>
      <p className="mt-2 text-2xl font-semibold tracking-tight">
        <span className="tabular-nums">
          {passed}/{criteria.length}
        </span>{" "}
        <span className="text-base font-normal text-muted-foreground">{t.dossier.passed}</span>
      </p>

      <ul className="mt-3 divide-y divide-border">
        {criteria.map((criterion) => (
          <li key={criterion.id}>
            <Collapsible
              triggerClassName="py-2.5"
              trigger={
                <span className="flex items-center gap-2.5 text-sm">
                  <span className={cn("size-2 shrink-0 rounded-full", dotClasses[criterion.result])} aria-hidden />
                  <span className="flex-1">{criterionLabels[criterion.id][lang]}</span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      criterion.result === "success" && "text-pass",
                      criterion.result === "failure" && "text-fail",
                      criterion.result === "unknown" && "text-muted-foreground",
                    )}
                  >
                    {statusLabel[criterion.result]}
                  </span>
                </span>
              }
            >
              <p className="pb-3 pl-[18px] text-sm leading-relaxed text-muted-foreground">
                {criterion.rationale ?? t.dossier.noRationale}
              </p>
            </Collapsible>
          </li>
        ))}
      </ul>
    </section>
  );
}
