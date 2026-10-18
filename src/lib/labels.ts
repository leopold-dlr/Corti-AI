import type { Criterion, DataField } from "@/lib/analysis";
import type { Lang } from "@/lib/i18n";

type Labels<K extends string> = Record<K, Record<Lang, string>>;

export const fieldLabels: Labels<DataField> = {
  consentement: { en: "Consent", fr: "Consentement" },
  role_interlocuteur: { en: "Role", fr: "Rôle" },
  type_structure: { en: "Firm type", fr: "Type de structure" },
  anciennete_annees: { en: "Years as a customer", fr: "Ancienneté (années)" },
  usage_principal: { en: "Main use", fr: "Usage principal" },
  score_satisfaction: { en: "Satisfaction", fr: "Satisfaction" },
  donnees_manquantes: { en: "Missing data", fr: "Données manquantes" },
  concurrents_cites: { en: "Competitors mentioned", fr: "Concurrents cités" },
  reaction_hausse_prix: { en: "Reaction to a price increase", fr: "Réaction à une hausse de prix" },
  intention_renouvellement: { en: "Renewal intent", fr: "Intention de renouvellement" },
  score_recommandation: { en: "Recommendation", fr: "Recommandation" },
  usage_ia_actuel: { en: "Current AI use", fr: "Usage actuel de l'IA" },
  position_donnees_ia: { en: "Stance on AI use of data", fr: "Position sur l'usage IA des données" },
  conditions_ia: { en: "Conditions for AI use", fr: "Conditions pour l'IA" },
  alerte_confidentialite: { en: "Confidentiality alert", fr: "Alerte confidentialité" },
  fonctionnalites_souhaitees: { en: "Requested features", fr: "Fonctionnalités souhaitées" },
};

export const criterionLabels: Labels<Criterion> = {
  transparence_consentement: { en: "AI disclosure and consent", fr: "Transparence et consentement" },
  neutralite: { en: "Neutrality", fr: "Neutralité" },
  conformite: { en: "No inside information", fr: "Aucune information privilégiée" },
  relances: { en: "Follow-up questions", fr: "Relances" },
  reponse_derniere_question: { en: "Last question answered", fr: "Réponse à la dernière question" },
  notes_obtenues: { en: "Scores collected", fr: "Notes obtenues" },
  aucune_promesse_non_prevue: { en: "No unplanned promises", fr: "Aucune promesse non prévue" },
};
