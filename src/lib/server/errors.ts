import "server-only";
import type { AnalysisErrorCode } from "@/lib/analysis";

export class AnalysisError extends Error {
  constructor(
    readonly code: AnalysisErrorCode,
    message: string,
    readonly status = 502,
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}
