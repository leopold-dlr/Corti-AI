"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "fr";

const messages = {
  en: {
    appName: "Voice Diligence Agent",
    title: "Meet Nicolas",
    pitch:
      "An AI voice agent that interviews customers for due diligence, then turns each call into structured data and an investment memo.",
    roleplay:
      "Play a Dealroom user (VC analyst, PE associate). About 8 minutes, in English or French.",
    start: "Start the interview",
    hangUp: "Hang up",
    copyNote: "Copy the memo",
    newInterview: "New interview",
    micBlocked:
      "Microphone blocked. Allow microphone access in your browser, then try again.",
    steps: ["Voice · ElevenLabs + Mistral", "Analysis · ElevenLabs", "Memo · Mistral"],
    connecting: "Connecting…",
    speaking: "Nicolas is speaking",
    listening: "Nicolas is listening",
    transcriptEmpty: "Nicolas will open the conversation.",
    callEnded: "Call ended",
    endedByAgent: "Nicolas ended the call.",
    endedByUser: "You ended the call.",
    missingAgentId: "Agent not configured: NEXT_PUBLIC_ELEVENLABS_AGENT_ID is missing.",
    connectionError: "The call could not start. Check your connection and try again.",
    disclaimer: "Fictional demo scenario. Not affiliated with Dealroom.co.",
    switchTo: "Français",
  },
  fr: {
    appName: "Voice Diligence Agent",
    title: "Voici Nicolas",
    pitch:
      "Un agent vocal IA qui mène des entretiens clients de due diligence, puis transforme chaque appel en données structurées et en note de synthèse.",
    roleplay:
      "Jouez un utilisateur de Dealroom (analyste VC, associate PE). Environ 8 minutes, en français ou en anglais.",
    start: "Commencer l'entretien",
    hangUp: "Raccrocher",
    copyNote: "Copier la note",
    newInterview: "Nouvel entretien",
    micBlocked:
      "Micro bloqué. Autorisez l'accès au micro dans votre navigateur, puis réessayez.",
    steps: ["Voix · ElevenLabs + Mistral", "Analyse · ElevenLabs", "Note · Mistral"],
    connecting: "Connexion…",
    speaking: "Nicolas parle",
    listening: "Nicolas vous écoute",
    transcriptEmpty: "Nicolas va ouvrir la conversation.",
    callEnded: "Appel terminé",
    endedByAgent: "Nicolas a raccroché.",
    endedByUser: "Vous avez raccroché.",
    missingAgentId: "Agent non configuré : NEXT_PUBLIC_ELEVENLABS_AGENT_ID est manquant.",
    connectionError: "L'appel n'a pas pu démarrer. Vérifiez votre connexion, puis réessayez.",
    disclaimer: "Scénario fictif de démonstration. Aucun lien avec Dealroom.co.",
    switchTo: "English",
  },
} as const;

export type Messages = (typeof messages)[Lang];

type LanguageContextValue = {
  lang: Lang;
  t: Messages;
  toggle: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "vda-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Anglais par défaut ; le choix du visiteur est mémorisé
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique au montage, localStorage n'existe pas côté serveur
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((current) => {
      const next = current === "en" ? "fr" : "en";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ lang, t: messages[lang], toggle }),
    [lang, toggle],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
