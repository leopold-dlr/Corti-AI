"use client";

import { DATA_FIELDS, isFilled, type AnalysisResult } from "@/lib/analysis";
import { formatValue } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";
import { fieldLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Collapsible } from "./Collapsible";

export function FieldsTable({ data }: { data: AnalysisResult["data"] }) {
  const { t, lang } = useLanguage();

  return (
    <Collapsible
      className="border-t border-border"
      triggerClassName="py-4"
      trigger={<span className="text-sm font-medium">{t.dossier.allFields}</span>}
    >
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {DATA_FIELDS.map((field) => (
              <tr key={field} className="align-top">
                <th scope="row" className="w-1/3 py-2.5 pr-4 text-left font-normal">
                  {fieldLabels[field][lang]}
                  <span className="block font-mono text-[11px] text-muted-foreground">{field}</span>
                </th>
                <td
                  className={cn("py-2.5 leading-relaxed", !isFilled(data[field]) && "text-muted-foreground")}
                >
                  {formatValue(data[field], t)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Collapsible>
  );
}
