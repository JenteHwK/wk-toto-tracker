"use client";

import * as React from "react";
import { animate, useInView } from "framer-motion";
import { EASE } from "@/lib/motion";

interface AnimatedCounterProps {
  value: number;
  format?: (n: number) => string;
  durationMs?: number;
  className?: string;
}

/** Counts up to `value` when it scrolls into view, then on every value change. */
export function AnimatedCounter({
  value,
  format = (n) => String(Math.round(n)),
  durationMs = 1100,
  className,
}: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const prev = React.useRef(0);

  React.useEffect(() => {
    if (!inView) return;
    const node = ref.current;
    if (!node) return;
    const controls = animate(prev.current, value, {
      duration: durationMs / 1000,
      ease: EASE,
      onUpdate(v) {
        node.textContent = format(v);
      },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, inView, durationMs, format]);

  return (
    <span ref={ref} className={className}>
      {format(0)}
    </span>
  );
}
