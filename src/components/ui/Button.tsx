"use client";

import { useRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { animatePress } from "@/components/animations/stepTransitions";
import styles from "./Button.module.css";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  fullWidth = false,
  loading = false,
  loadingLabel = "Submitting…",
  disabled,
  className,
  children,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  ...rest
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const variantClass = styles[variant];
  const classes = [styles.button, variantClass, fullWidth ? styles.fullWidth : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      className={`${classes} ${className ?? ""}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onPointerDown={(e) => {
        if (ref.current) animatePress(ref.current, true);
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        if (ref.current) animatePress(ref.current, false);
        onPointerUp?.(e);
      }}
      onPointerLeave={(e) => {
        if (ref.current) animatePress(ref.current, false);
        onPointerLeave?.(e);
      }}
      {...rest}
    >
      {loading ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
