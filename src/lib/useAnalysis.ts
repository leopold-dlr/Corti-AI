"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnalysisErrorBody, AnalysisErrorCode, AnalysisResult } from "@/lib/analysis";

export type AnalysisState =
  | { status: "loading" }
  | { status: "success"; result: AnalysisResult }
  | { status: "error"; code: AnalysisErrorCode | "network" };

/** Lance POST /api/analyse pour une conversation, avec possibilité de relancer */
export function useAnalysis(conversationId: string) {
  const [state, setState] = useState<AnalysisState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/analyse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const json: unknown = await response.json();
        if (response.ok) {
          setState({ status: "success", result: json as AnalysisResult });
        } else {
          setState({ status: "error", code: (json as AnalysisErrorBody).error?.code ?? "network" });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("[analyse]", error);
        setState({ status: "error", code: "network" });
      });

    return () => controller.abort();
  }, [conversationId, attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}
