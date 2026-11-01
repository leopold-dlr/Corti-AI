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
    title: "Meet Bob",
    pitch:
      "An AI voice agent that runs the customer calls of a commercial due diligence on PitchBook: satisfaction, pricing, renewal, AI use. Each call becomes structured data and an investment memo.",
    roleplay:
      "Play a PitchBook user (VC analyst, PE associate). About 5 minutes, in English or French.",
    start: "Start the interview",
    hangUp: "Hang up",
    copyNote: "Copy the memo",
    newInterview: "New interview",
    micBlocked:
      "Microphone blocked. Allow microphone access in your browser, then try again.",
    steps: ["Voice · ElevenLabs + Mistral", "Analysis · ElevenLabs", "Memo · Mistral"],
    connecting: "Connecting…",
    speaking: "Bob is speaking",
    listening: "Bob is listening",
    transcriptEmpty: "Bob will open the conversation.",
    callEnded: "Call ended",
    endedByAgent: "Bob ended the call.",
    endedByUser: "You ended the call.",
    missingAgentId: "Agent not configured: NEXT_PUBLIC_ELEVENLABS_AGENT_ID is missing.",
    connectionError: "The call could not start. Check your connection and try again.",
    analysing: "Analysing the interview…",
    retryAnalysis: "Retry the analysis",
    analysisErrors: {
      invalid_request: "The conversation ID is invalid.",
      config_missing: "The server is missing an API key.",
      conversation_not_found: "ElevenLabs could not find this conversation.",
      conversation_failed: "ElevenLabs could not process this call.",
      analysis_timeout: "ElevenLabs analysis took longer than 90 seconds.",
      elevenlabs_error: "Could not fetch the call from ElevenLabs.",
      empty_transcript: "The call has no transcript to analyse.",
      mistral_error: "Mistral could not write the memo.",
      network: "Could not reach the server.",
    },
    dossier: {
      title: "Interview dossier",
      steps: ["Transcript retrieved", "Data extracted", "Quality control", "Memo written"],
      keyMetrics: "Key metrics",
      satisfaction: "Satisfaction",
      recommendation: "Recommendation",
      priceReaction: "Price increase",
      renewal: "Renewal",
      completeness: "Completeness",
      missing: "Missing:",
      quality: "Quality control",
      passed: "criteria passed",
      pass: "Passed",
      fail: "Failed",
      unknown: "Not evaluated",
      noRationale: "No rationale returned.",
      positives: "Positive signals",
      risks: "Risk signals",
      verbatims: "Verbatims",
      aiInsights: "Data and AI insights",
      toVerify: "Points to verify",
      allFields: "All 16 fields",
      notProvided: "Not provided",
      yes: "Yes",
      no: "No",
      confidentialityAlert:
        "Confidentiality alert: the interviewee may have shared confidential information. Review before circulating this dossier.",
      copied: "Copied",
      memoLanguage: "Memo written by Mistral, in French.",
    },
    disclaimer: "Fictional demo scenario. Not affiliated with PitchBook.",
    switchTo: "Français",
  },
  fr: {
    appName: "Voice Diligence Agent",
    title: "Voici Bob",
    pitch:
      "Un agent vocal IA qui mène les appels clients d'une due diligence commerciale sur PitchBook : satisfaction, prix, renouvellement, usage de l'IA. Chaque appel devient des données structurées et une note de synthèse.",
    roleplay:
      "Jouez un utilisateur de PitchBook (analyste VC, associate PE). Environ 5 minutes, en français ou en anglais.",
    start: "Commencer l'entretien",
    hangUp: "Raccrocher",
    copyNote: "Copier la note",
    newInterview: "Nouvel entretien",
    micBlocked:
      "Micro bloqué. Autorisez l'accès au micro dans votre navigateur, puis réessayez.",
    steps: ["Voix · ElevenLabs + Mistral", "Analyse · ElevenLabs", "Note · Mistral"],
    connecting: "Connexion…",
    speaking: "Bob parle",
    listening: "Bob vous écoute",
    transcriptEmpty: "Bob va ouvrir la conversation.",
    callEnded: "Appel terminé",
    endedByAgent: "Bob a raccroché.",
    endedByUser: "Vous avez raccroché.",
    missingAgentId: "Agent non configuré : NEXT_PUBLIC_ELEVENLABS_AGENT_ID est manquant.",
    connectionError: "L'appel n'a pas pu démarrer. Vérifiez votre connexion, puis réessayez.",
    analysing: "Analyse de l'entretien…",
    retryAnalysis: "Relancer l'analyse",
    analysisErrors: {
      invalid_request: "L'identifiant de conversation est invalide.",
      config_missing: "Il manque une clé API côté serveur.",
      conversation_not_found: "ElevenLabs ne trouve pas cette conversation.",
      conversation_failed: "ElevenLabs n'a pas pu traiter cet appel.",
      analysis_timeout: "L'analyse ElevenLabs a pris plus de 90 secondes.",
      elevenlabs_error: "Impossible de récupérer l'appel auprès d'ElevenLabs.",
      empty_transcript: "L'appel ne contient aucune transcription à analyser.",
      mistral_error: "Mistral n'a pas pu rédiger la note.",
      network: "Impossible de joindre le serveur.",
    },
    dossier: {
      title: "Dossier d'entretien",
      steps: ["Transcription récupérée", "Données extraites", "Contrôle qualité", "Note de synthèse rédigée"],
      keyMetrics: "Indicateurs clés",
      satisfaction: "Satisfaction",
      recommendation: "Recommandation",
      priceReaction: "Hausse de prix",
      renewal: "Renouvellement",
      completeness: "Complétude",
      missing: "Manquants :",
      quality: "Contrôle qualité",
      passed: "critères validés",
      pass: "Validé",
      fail: "Échec",
      unknown: "Non évalué",
      noRationale: "Aucune justification renvoyée.",
      positives: "Signaux positifs",
      risks: "Signaux de risque",
      verbatims: "Verbatims",
      aiInsights: "Enseignements données et IA",
      toVerify: "Points à vérifier",
      allFields: "Les 16 champs",
      notProvided: "Non renseigné",
      yes: "Oui",
      no: "Non",
      confidentialityAlert:
        "Alerte confidentialité : l'interlocuteur a peut-être partagé des informations confidentielles. À vérifier avant de diffuser ce dossier.",
      copied: "Copié",
      memoLanguage: "Note rédigée par Mistral, en français.",
    },
    disclaimer: "Scénario fictif de démonstration. Aucun lien avec PitchBook.",
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
