import "server-only";
import { z } from "zod";
import {
  CRITERIA,
  DATA_FIELDS,
  type CriterionResult,
  type DataField,
  type FieldValue,
  type TranscriptTurn,
} from "@/lib/analysis";
import { AnalysisError } from "@/lib/server/errors";

const API_URL = "https://api.elevenlabs.io/v1/convai/conversations";
const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 90_000;

// Seuls les champs utilisés sont validés ; le reste de la réponse est ignoré
const conversationSchema = z.object({
  conversation_id: z.string(),
  status: z.string(),
  transcript: z
    .array(
      z.object({
        role: z.enum(["user", "agent"]),
        message: z.string().nullish(),
        time_in_call_secs: z.number().nullish(),
      }),
    )
    .nullish(),
  metadata: z
    .object({
      call_duration_secs: z.number().nullish(),
      start_time_unix_secs: z.number().nullish(),
    })
    .nullish(),
  analysis: z
    .object({
      evaluation_criteria_results: z
        .record(
          z.string(),
          z.object({ result: z.string(), rationale: z.string().nullish() }),
        )
        .nullish(),
      data_collection_results: z
        .record(z.string(), z.object({ value: z.unknown() }))
        .nullish(),
    })
    .nullish(),
});

type Conversation = z.infer<typeof conversationSchema>;

export type ConversationData = {
  durationSecs: number | null;
  startedAt: number | null;
  transcript: TranscriptTurn[];
  data: Record<DataField, FieldValue>;
  criteria: CriterionResult[];
};

/**
 * Attend que ElevenLabs ait fini de traiter l'appel (statut "done" et analyse présente),
 * en interrogeant l'API toutes les 3 secondes pendant 90 secondes au plus.
 */
export async function fetchProcessedConversation(conversationId: string): Promise<ConversationData> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new AnalysisError("config_missing", "ELEVENLABS_API_KEY is not set.", 500);

  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (true) {
    const conversation = await getConversation(conversationId, apiKey);

    if (conversation.status === "failed") {
      throw new AnalysisError("conversation_failed", "ElevenLabs could not process this conversation.");
    }
    if (conversation.status === "done" && conversation.analysis) {
      return toConversationData(conversation);
    }
    if (Date.now() + POLL_INTERVAL_MS > deadline) {
      throw new AnalysisError(
        "analysis_timeout",
        "ElevenLabs analysis was not ready after 90 seconds.",
        504,
      );
    }
    await sleep(POLL_INTERVAL_MS);
  }
}

async function getConversation(conversationId: string, apiKey: string): Promise<Conversation> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/${encodeURIComponent(conversationId)}`, {
      headers: { "xi-api-key": apiKey },
      cache: "no-store",
    });
  } catch {
    throw new AnalysisError("elevenlabs_error", "Could not reach the ElevenLabs API.");
  }

  if (response.status === 404) {
    throw new AnalysisError("conversation_not_found", "Conversation not found on ElevenLabs.", 404);
  }
  if (!response.ok) {
    throw new AnalysisError("elevenlabs_error", `ElevenLabs API returned ${response.status}.`);
  }

  const parsed = conversationSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new AnalysisError("elevenlabs_error", "Unexpected response format from ElevenLabs.");
  }
  return parsed.data;
}

function toConversationData(conversation: Conversation): ConversationData {
  const collected = conversation.analysis?.data_collection_results ?? {};
  const evaluated = conversation.analysis?.evaluation_criteria_results ?? {};

  const data = Object.fromEntries(
    DATA_FIELDS.map((field) => [field, normalizeValue(collected[field]?.value)]),
  ) as Record<DataField, FieldValue>;

  const criteria: CriterionResult[] = CRITERIA.map((id) => {
    const entry = evaluated[id];
    const result = entry?.result === "success" || entry?.result === "failure" ? entry.result : "unknown";
    return { id, result, rationale: entry?.rationale ?? null };
  });

  const transcript: TranscriptTurn[] = (conversation.transcript ?? [])
    .filter((turn) => turn.message?.trim())
    .map((turn) => ({
      role: turn.role,
      message: turn.message!.trim(),
      timeSecs: turn.time_in_call_secs ?? null,
    }));

  return {
    durationSecs: conversation.metadata?.call_duration_secs ?? null,
    startedAt: conversation.metadata?.start_time_unix_secs ?? null,
    transcript,
    data,
    criteria,
  };
}

function normalizeValue(value: unknown): FieldValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return JSON.stringify(value);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
