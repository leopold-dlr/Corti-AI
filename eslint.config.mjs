import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Composants tiers copiés tels quels depuis le registre ElevenLabs UI
    "src/components/ui/orb.tsx",
    "src/components/ui/waveform.tsx",
  ]),
]);

export default eslintConfig;
