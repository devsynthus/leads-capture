"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { animateEnter, animateExit } from "./stepTransitions";

export function useStepTransition(stepKey: string) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ctx = gsap.context(() => animateEnter(el), el);
    return () => ctx.revert();
  }, [stepKey]);

  const runExit = useCallback((onComplete: () => void) => {
    const el = containerRef.current;
    if (!el) {
      onComplete();
      return;
    }
    animateExit(el, onComplete);
  }, []);

  return { containerRef, runExit };
}
