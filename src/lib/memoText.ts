import type { AnalysisResult } from "@/lib/analysis";
import { formatValue } from "@/lib/format";
import type { Messages } from "@/lib/i18n";

/** Version texte de la note, pour le presse-papiers */
export function memoToText(result: AnalysisResult, t: Messages): string {
  const { memo, data, completeness, criteria } = result;
  const d = t.dossier;
  const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");
  const passed = criteria.filter((c) => c.result === "success").length;

  return [
    `# ${d.title}`,
    memo.synthese,
    `## ${d.keyMetrics}`,
    [
      `- ${d.satisfaction} : ${formatValue(data.score_satisfaction, t)}/10`,
      `- ${d.recommendation} : ${formatValue(data.score_recommandation, t)}/10`,
      `- ${d.priceReaction} : ${formatValue(data.reaction_hausse_prix, t)}`,
      `- ${d.renewal} : ${formatValue(data.intention_renouvellement, t)}`,
      `- ${d.completeness} : ${Math.round(completeness.rate * 100)} % (${completeness.filled}/${completeness.total})`,
      `- ${d.quality} : ${passed}/${criteria.length} ${d.passed}`,
    ].join("\n"),
    `## ${d.positives}`,
    list(memo.signaux_positifs),
    `## ${d.risks}`,
    list(memo.signaux_de_risque),
    `## ${d.verbatims}`,
    memo.verbatims.map((quote) => `> « ${quote} »`).join("\n"),
    `## ${d.aiInsights}`,
    memo.enseignements_donnees_ia,
    `## ${d.toVerify}`,
    list(memo.points_a_verifier),
  ].join("\n\n");
}
