import type { Variants } from "motion/react";
import { spring } from "@/lib/motion";

// Le dossier se révèle d'un seul mouvement, avec un léger décalage entre blocs
export const revealContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: spring },
};
