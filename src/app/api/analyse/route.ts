import { z } from "zod";
import {
  computeCompleteness,
  type AnalysisErrorBody,
  type AnalysisErrorCode,
  type AnalysisResult,
} from "@/lib/analysis";
import { fetchProcessedConversation } from "@/lib/server/elevenlabs";
import { AnalysisError } from "@/lib/server/errors";
import { writeMemo } from "@/lib/server/mistral";

// 90 s d'attente de l'analyse ElevenLabs, plus la rédaction Mistral
export const maxDuration = 120;

const bodySchema = z.object({
  conversationId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/),
});

export async function POST(request: Request) {
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return errorResponse("invalid_request", "A valid conversationId is required.", 400);
  }

  const { conversationId } = body.data;

  try {
    const conversation = await fetchProcessedConversation(conversationId);
    if (conversation.transcript.length === 0) {
      throw new AnalysisError("empty_transcript", "The conversation has no transcript.", 422);
    }

    const memo = await writeMemo(conversation.transcript);

    const result: AnalysisResult = {
      conversationId,
      durationSecs: conversation.durationSecs,
      startedAt: conversation.startedAt,
      data: conversation.data,
      criteria: conversation.criteria,
      completeness: computeCompleteness(conversation.data),
      memo,
      transcript: conversation.transcript,
    };
    return Response.json(result);
  } catch (error) {
    if (error instanceof AnalysisError) {
      return errorResponse(error.code, error.message, error.status);
    }
    console.error("[analyse]", error);
    return errorResponse("elevenlabs_error", "Unexpected server error.", 500);
  }
}

function errorResponse(code: AnalysisErrorCode, message: string, status: number) {
  const body: AnalysisErrorBody = { error: { code, message } };
  return Response.json(body, { status });
}
