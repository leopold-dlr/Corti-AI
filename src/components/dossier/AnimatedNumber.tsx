"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";

type AnimatedNumberProps = {
  value: number;
  /** Nombre de décimales affichées */
  decimals?: number;
  suffix?: string;
};

// Compteur qui défile jusqu'à sa valeur à l'apparition, avec un ressort
export function AnimatedNumber({ value, decimals = 0, suffix = "" }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const format = (n: number) => `${n.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reducedMotion) {
      node.textContent = format(value);
      return;
    }
    const controls = animate(0, value, {
      type: "spring",
      stiffness: 60,
      damping: 18,
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
    });
    return () => controls.stop();
    // format dépend uniquement de decimals et suffix
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, decimals, suffix, reducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(reducedMotion ? value : 0)}
    </span>
  );
}
