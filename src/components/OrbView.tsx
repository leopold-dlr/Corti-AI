"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { AgentState } from "@/components/ui/orb";
import { cn } from "@/lib/utils";

// Three.js n'est chargé que dans le navigateur
const Orb = dynamic(() => import("@/components/ui/orb").then((m) => m.Orb), {
  ssr: false,
  loading: () => <StaticOrb />,
});

// Identité visuelle de Bob. Le shader dégrade noir → couleur 1 → couleur 2 → blanc ;
// dans cet ordre, l'ambre occupe le cœur et le bleu le contour, les deux restent lisibles.
export const ORB_COLORS: [string, string] = ["#F5B700", "#3B5BDB"];

type OrbViewProps = {
  agentState?: AgentState;
  getInputVolume?: () => number;
  getOutputVolume?: () => number;
  /** Fige l'Orb (petite Orb de l'en-tête du dossier) */
  still?: boolean;
  className?: string;
};

export function OrbView({
  agentState = null,
  getInputVolume,
  getOutputVolume,
  still = false,
  className,
}: OrbViewProps) {
  const reducedMotion = useReducedMotion();
  const webgl = useWebGLSupport();
  const live = Boolean(getInputVolume && getOutputVolume);

  return (
    <div className={cn("relative aspect-square", className)}>
      {still || reducedMotion || webgl === false ? (
        <StaticOrb />
      ) : webgl ? (
        <Orb
          colors={ORB_COLORS}
          seed={7}
          agentState={agentState}
          volumeMode={live ? "manual" : "auto"}
          getInputVolume={getInputVolume}
          getOutputVolume={getOutputVolume}
          className="absolute inset-0"
        />
      ) : null}
    </div>
  );
}

// Repli sans WebGL ou avec prefers-reduced-motion : un disque dégradé fixe
function StaticOrb() {
  return (
    <div
      aria-hidden
      className="absolute inset-[6%] rounded-full"
      style={{
        background: `radial-gradient(circle at 35% 30%, #fff8 0%, transparent 35%), conic-gradient(from 200deg, ${ORB_COLORS[0]}, ${ORB_COLORS[1]}, ${ORB_COLORS[0]})`,
        filter: "saturate(0.9)",
      }}
    />
  );
}

/** null tant que la détection n'a pas eu lieu (rendu serveur) */
function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ok = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- détection unique au montage, impossible côté serveur
    setSupported(ok);
  }, []);
  return supported;
}
