/*
 * Licensed under GPL-3.0-or-later
 * Utility to conditionally return motion props based on reduced motion preference.
 */
export function prefersReducedMotion<T>(reduce: boolean, motionProps: T): T | undefined {
  return reduce ? undefined : motionProps;
}
