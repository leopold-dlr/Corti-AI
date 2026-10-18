"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PhoneOff } from "lucide-react";
import { Waveform } from "@/components/ui/waveform";
import { useLanguage } from "@/lib/i18n";
import { spring, tap } from "@/lib/motion";

const BAR_COUNT = 10;

type CallPillProps = {
  connectedAt: number | null;
  /** Spectre (0-255) de la voix qui parle en ce moment */
  getFrequencyData: () => Uint8Array;
  onHangUp: () => void;
};

// Pastille d'appel façon Dynamic Island : se déplie depuis un point, se replie à la sortie
export function CallPill({ connectedAt, getFrequencyData, onHangUp }: CallPillProps) {
  const { t } = useLanguage();
  const bars = useFrequencyBars(getFrequencyData);
  const elapsed = useElapsed(connectedAt);

  return (
    <motion.div
      initial={{ width: 14, height: 14, opacity: 0 }}
      animate={{ width: 248, height: 44, opacity: 1 }}
      exit={{ width: 14, height: 14, opacity: 0 }}
      transition={spring}
      className="fixed top-2 left-1/2 z-40 flex -translate-x-1/2 items-center overflow-hidden rounded-full bg-black text-white shadow-lg dark:ring-1 dark:ring-white/15"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.05 } }}
        transition={{ ...spring, delay: 0.12 }}
        className="flex w-full items-center gap-3 pr-1.5 pl-4"
      >
        <Waveform
          data={bars}
          height={18}
          barWidth={2}
          barGap={2}
          barHeight={2}
          barRadius={1}
          barColor="#F5B700"
          fadeEdges={false}
          className="w-[38px] shrink-0"
        />
        <span className="text-sm font-medium">Nicolas</span>
        <span className="ml-auto font-mono text-sm tabular-nums text-white/70">
          {elapsed}
        </span>
        <motion.button
          type="button"
          onClick={onHangUp}
          whileTap={tap}
          transition={spring}
          aria-label={t.hangUp}
          title={t.hangUp}
          className="flex size-8 items-center justify-center rounded-full bg-fail focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <PhoneOff className="size-4" aria-hidden />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/** Réduit le spectre à quelques barres normalisées (0-1), environ 20 fois par seconde */
function useFrequencyBars(getFrequencyData: () => Uint8Array) {
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(0));

  useEffect(() => {
    const id = window.setInterval(() => {
      const data = getFrequencyData();
      if (!data.length) return;
      const step = Math.floor(data.length / BAR_COUNT) || 1;
      const next = Array.from({ length: BAR_COUNT }, (_, i) => {
        let sum = 0;
        for (let j = 0; j < step; j++) sum += data[i * step + j] ?? 0;
        return Math.min(1, (sum / step / 255) * 1.6);
      });
      setBars(next);
    }, 50);
    return () => window.clearInterval(id);
  }, [getFrequencyData]);

  return bars;
}

function useElapsed(since: number | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const seconds = since ? Math.max(0, Math.floor((now - since) / 1000)) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
