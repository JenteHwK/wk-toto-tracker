// Shared easing tuple — typed as a 4-number cubic-bezier so Framer Motion's
// `Easing` type accepts it (a bare array infers to number[] and fails).
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
