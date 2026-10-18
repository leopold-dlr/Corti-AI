import { z } from "zod";

// Identifiants exacts configurés dans l'agent ElevenLabs
export const DATA_FIELDS = [
  "consentement",
  "role_interlocuteur",
  "type_structure",
  "anciennete_annees",
  "usage_principal",
  "score_satisfaction",
  "donnees_manquantes",
  "concurrents_cites",
  "reaction_hausse_prix",
  "intention_renouvellement",
  "score_recommandation",
  "usage_ia_actuel",
  "position_donnees_ia",
  "conditions_ia",
  "alerte_confidentialite",
  "fonctionnalites_souhaitees",
] as const;

export const CRITERIA = [
  "transparence_consentement",
  "neutralite",
  "conformite",
  "relances",
  "reponse_derniere_question",
  "notes_obtenues",
  "aucune_promesse_non_prevue",
] as const;

export type DataField = (typeof DATA_FIELDS)[number];
export type Criterion = (typeof CRITERIA)[number];
export type FieldValue = string | number | boolean | null;

export const memoSchema = z.object({
  synthese: z.string().min(1),
  signaux_positifs: z.array(z.string()),
  signaux_de_risque: z.array(z.string()),
  verbatims: z.array(z.string()),
  enseignements_donnees_ia: z.string(),
  points_a_verifier: z.array(z.string()),
});

export type Memo = z.infer<typeof memoSchema>;

export type CriterionResult = {
  id: Criterion;
  result: "success" | "failure" | "unknown";
  rationale: string | null;
};

export type TranscriptTurn = {
  role: "user" | "agent";
  message: string;
  timeSecs: number | null;
};

/** Réponse unique de POST /api/analyse */
export type AnalysisResult = {
  conversationId: string;
  durationSecs: number | null;
  startedAt: number | null;
  data: Record<DataField, FieldValue>;
  criteria: CriterionResult[];
  completeness: {
    filled: number;
    total: number;
    rate: number;
    missing: DataField[];
  };
  memo: Memo;
  transcript: TranscriptTurn[];
};

export type AnalysisErrorCode =
  | "invalid_request"
  | "config_missing"
  | "conversation_not_found"
  | "conversation_failed"
  | "analysis_timeout"
  | "elevenlabs_error"
  | "empty_transcript"
  | "mistral_error";

export type AnalysisErrorBody = { error: { code: AnalysisErrorCode; message: string } };

/** Un champ compte comme renseigné s'il n'est ni nul ni vide */
export function isFilled(value: FieldValue): boolean {
  return value !== null && !(typeof value === "string" && value.trim() === "");
}

/** Taux de complétude calculé sans LLM, à partir des seules valeurs extraites */
export function computeCompleteness(data: Record<DataField, FieldValue>) {
  const missing = DATA_FIELDS.filter((field) => !isFilled(data[field]));
  const filled = DATA_FIELDS.length - missing.length;
  return {
    filled,
    total: DATA_FIELDS.length,
    rate: filled / DATA_FIELDS.length,
    missing,
  };
}
