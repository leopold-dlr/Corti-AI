import type { Transition } from "motion/react";

// Seule courbe d'animation du projet : un ressort, jamais d'interpolation linéaire
export const spring: Transition = { type: "spring", stiffness: 300, damping: 30 };

// Ressort plus souple pour les grands éléments (l'Orb)
export const softSpring: Transition = { type: "spring", stiffness: 160, damping: 22 };

export const tap = { scale: 0.97 };
