"use client";

import { useRef, useState } from "react";
import { AnimatePresence, LayoutGroup } from "motion/react";
import {
  useConversationControls,
  useConversationMode,
  useConversationStatus,
} from "@elevenlabs/react";
import { CallPill } from "@/components/CallPill";
import { CallScreen, type TranscriptLine } from "@/components/CallScreen";
import { EndedScreen } from "@/components/EndedScreen";
import { HomeScreen } from "@/components/HomeScreen";
import { useLanguage } from "@/lib/i18n";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

type Phase =
  | { name: "idle" }
  | { name: "call" }
  | { name: "ended"; conversationId: string; endedBy: "agent" | "user" | "error" };

export function InterviewFlow() {
  const { t } = useLanguage();
  const controls = useConversationControls();
  const { status } = useConversationStatus();
  const { isSpeaking } = useConversationMode();

  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  // Lu dans les callbacks du SDK, qui peuvent s'enchaîner avant un nouveau rendu
  const conversationIdRef = useRef<string | null>(null);
  const lineIdRef = useRef(0);

  async function start() {
    setError(null);
    if (!AGENT_ID) {
      setError(t.missingAgentId);
      return;
    }

    // Demande explicite du micro avant l'appel, pour un message clair en cas de refus
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setError(t.micBlocked);
      return;
    }

    conversationIdRef.current = null;
    lineIdRef.current = 0;
    setTranscript([]);
    setConnectedAt(null);
    setPhase({ name: "call" });
    controls.startSession({
      agentId: AGENT_ID,
      connectionType: "webrtc",
      onConnect: ({ conversationId }) => {
        conversationIdRef.current = conversationId;
        setConnectedAt(Date.now());
      },
      onMessage: ({ message, role }) => {
        if (!message) return;
        setTranscript((lines) => [...lines, { id: lineIdRef.current++, role, text: message }]);
      },
      onDisconnect: (details) => {
        const conversationId = conversationIdRef.current;
        // Que ce soit le visiteur ou Nicolas qui raccroche, on passe à la suite dès qu'un appel a eu lieu
        if (conversationId) {
          setPhase({ name: "ended", conversationId, endedBy: details.reason });
        } else {
          setPhase({ name: "idle" });
          if (details.reason === "error") setError(t.connectionError);
        }
      },
      onError: (message) => {
        console.error("[ElevenLabs]", message);
      },
    });
  }

  function restart() {
    setPhase({ name: "idle" });
  }

  const connected = status === "connected";
  const getPillFrequencies = isSpeaking
    ? controls.getOutputByteFrequencyData
    : controls.getInputByteFrequencyData;

  return (
    <LayoutGroup>
      <AnimatePresence>
        {phase.name === "call" ? (
          <CallPill
            key="pill"
            connectedAt={connectedAt}
            getFrequencyData={getPillFrequencies}
            onHangUp={controls.endSession}
          />
        ) : null}
      </AnimatePresence>

      {phase.name === "idle" ? <HomeScreen onStart={start} error={error} /> : null}

      {phase.name === "call" ? (
        <CallScreen
          connected={connected}
          isSpeaking={isSpeaking}
          transcript={transcript}
          getInputVolume={controls.getInputVolume}
          getOutputVolume={controls.getOutputVolume}
        />
      ) : null}

      {phase.name === "ended" ? (
        <EndedScreen
          conversationId={phase.conversationId}
          endedBy={phase.endedBy}
          onRestart={restart}
        />
      ) : null}
    </LayoutGroup>
  );
}
