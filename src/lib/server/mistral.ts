import "server-only";
import { Mistral } from "@mistralai/mistralai";
import { memoSchema, type Memo, type TranscriptTurn } from "@/lib/analysis";
import { AnalysisError } from "@/lib/server/errors";

const MODEL = "mistral-medium-latest";
const MAX_ATTEMPTS = 2;

const PROMPT = `Tu reçois la transcription d'un entretien client mené dans le cadre d'une due diligence sur PitchBook, une plateforme de données sur les marchés privés. Rédige une note de synthèse pour l'équipe d'investissement, en français, au format JSON suivant :
{
  "synthese": string (3 phrases maximum),
  "signaux_positifs": string[],
  "signaux_de_risque": string[],
  "verbatims": string[] (2 ou 3 citations courtes et fidèles de l'interlocuteur),
  "enseignements_donnees_ia": string (ce que l'entretien révèle sur les données qui manquent aux professionnels et sur les conditions auxquelles ils accepteraient que ces données soient utilisées par l'IA),
  "points_a_verifier": string[]
}
N'invente rien qui ne figure pas dans la transcription. Les verbatims doivent être des citations exactes. Si un élément n'a pas été abordé, indique 'Non abordé'.`;

/** Rédige la note de synthèse ; un second essai si la réponse n'est pas un JSON conforme */
export async function writeMemo(transcript: TranscriptTurn[]): Promise<Memo> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new AnalysisError("config_missing", "MISTRAL_API_KEY is not set.", 500);

  const client = new Mistral({ apiKey });
  const text = formatTranscript(transcript);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let content: string;
    try {
      const response = await client.chat.complete({
        model: MODEL,
        responseFormat: { type: "json_object" },
        temperature: 0.2,
        messages: [
          { role: "system", content: PROMPT },
          { role: "user", content: text },
        ],
      });
      content = readContent(response.choices?.[0]?.message?.content);
    } catch (error) {
      console.error("[Mistral]", error);
      throw new AnalysisError("mistral_error", "The Mistral API call failed.");
    }

    const memo = parseMemo(content);
    if (memo) return memo;
    console.warn(`[Mistral] invalid JSON memo (attempt ${attempt}/${MAX_ATTEMPTS})`);
  }

  throw new AnalysisError("mistral_error", "Mistral returned an invalid memo twice.");
}

function formatTranscript(transcript: TranscriptTurn[]) {
  return transcript
    .map((turn) => `${turn.role === "agent" ? "Bob (enquêteur)" : "Interlocuteur"} : ${turn.message}`)
    .join("\n");
}

type MessageContent = string | Array<{ type: string; text?: string }> | null | undefined;

function readContent(content: MessageContent): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((chunk) => (chunk.type === "text" ? (chunk.text ?? "") : "")).join("");
  }
  return "";
}

function parseMemo(content: string): Memo | null {
  try {
    const parsed = memoSchema.safeParse(JSON.parse(content));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
