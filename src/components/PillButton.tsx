"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { spring, tap } from "@/lib/motion";
import { cn } from "@/lib/utils";

type PillButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "danger";
};

const variants = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  danger: "bg-fail text-white",
} as const;

export function PillButton({
  variant = "primary",
  className,
  type = "button",
  ...props
}: PillButtonProps) {
  return (
    <motion.button
      type={type}
      whileTap={props.disabled ? undefined : tap}
      transition={spring}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-medium",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
