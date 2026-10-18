"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type CollapsibleProps = {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
};

// Dépliage avec animation de hauteur fluide
export function Collapsible({ trigger, children, className, triggerClassName }: CollapsibleProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          triggerClassName,
        )}
      >
        <span className="flex-1">{trigger}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring} className="shrink-0">
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={id}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
