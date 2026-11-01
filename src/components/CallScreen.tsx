"use client";

import { useCallback } from "react";
import { motion } from "motion/react";
import { OrbView } from "@/components/OrbView";
import { Conversation, ConversationContent } from "@/components/ui/conversation";
import { Message, MessageContent } from "@/components/ui/message";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import type { AgentState } from "@/components/ui/orb";
import { useLanguage } from "@/lib/i18n";
import { spring } from "@/lib/motion";

export type TranscriptLine = { id: number; role: "user" | "agent"; text: string };

type CallScreenProps = {
  connected: boolean;
  isSpeaking: boolean;
  transcript: TranscriptLine[];
  getInputVolume: () => number;
  getOutputVolume: () => number;
};

export function CallScreen({
  connected,
  isSpeaking,
  transcript,
  getInputVolume,
  getOutputVolume,
}: CallScreenProps) {
  const { t } = useLanguage();

  // Courbe de réponse de l'Orb : forte quand Bob parle, plus douce pour l'interlocuteur
  const orbInput = useCallback(
    () => Math.min(1, Math.sqrt(getInputVolume()) * 1.4),
    [getInputVolume],
  );
  const orbOutput = useCallback(
    () => Math.min(1, Math.sqrt(getOutputVolume()) * 2.5),
    [getOutputVolume],
  );

  const agentState: AgentState = !connected ? "thinking" : isSpeaking ? "talking" : "listening";
  const status = !connected ? t.connecting : isSpeaking ? t.speaking : t.listening;

  return (
    // Même contrainte que l'accueil : tout tient à l'écran, l'Orb prend la place restante
    <div className="flex h-[calc(100svh-7rem)] min-h-min flex-col items-center px-5 pt-[clamp(1rem,5svh,5rem)] pb-4 sm:px-8">
      <div className="flex min-h-min w-full flex-1 items-center justify-center">
        <motion.div
          layoutId="orb"
          transition={spring}
          className="aspect-square h-full min-h-24 max-h-[min(64vw,300px)]"
        >
          <OrbView
            className="h-full"
            agentState={agentState}
            getInputVolume={connected ? orbInput : undefined}
            getOutputVolume={connected ? orbOutput : undefined}
          />
        </motion.div>
      </div>

      <div className="mt-6 h-6 shrink-0 text-base font-medium" aria-live="polite">
        <ShimmeringText key={status} text={status} duration={1.6} repeatDelay={0.4} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.15 }}
        className="mt-6 w-full max-w-xl shrink-0"
      >
        <Conversation className="h-[clamp(10rem,32svh,18rem)] [mask-image:linear-gradient(to_bottom,transparent,black_3rem)]">
          <ConversationContent className="flex min-h-full flex-col justify-end px-1 pt-12 pb-2">
            {transcript.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">{t.transcriptEmpty}</p>
            ) : (
              transcript.map((line) => (
                <Message key={line.id} from={line.role === "user" ? "user" : "assistant"} className="py-1.5">
                  <MessageContent variant="contained" className="text-[15px] leading-relaxed">
                    {line.text}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
        </Conversation>
      </motion.div>
    </div>
  );
}
