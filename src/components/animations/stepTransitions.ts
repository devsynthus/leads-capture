import gsap from "gsap";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function animateEnter(el: HTMLElement) {
  if (prefersReducedMotion()) {
    gsap.set(el, { opacity: 1, y: 0 });
    return;
  }
  gsap.fromTo(
    el,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }
  );
}

export function animateExit(el: HTMLElement, onComplete: () => void) {
  if (prefersReducedMotion()) {
    onComplete();
    return;
  }
  gsap.to(el, {
    opacity: 0,
    y: -12,
    duration: 0.2,
    ease: "power2.in",
    onComplete,
  });
}

export function animatePress(el: HTMLElement, pressed: boolean) {
  if (prefersReducedMotion()) return;
  gsap.to(el, {
    scale: pressed ? 0.96 : 1,
    duration: 0.15,
    ease: "power2.out",
  });
}
