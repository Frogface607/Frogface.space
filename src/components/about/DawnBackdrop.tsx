'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Fixed backdrop that warms from cool swamp (top) to golden dawn (bottom)
 * as the story progresses toward the Tower. Pure color, GPU-cheap.
 */
export default function DawnBackdrop() {
  const { scrollYProgress } = useScroll();

  // cool olive-grey swamp -> warm tan dawn
  const background = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      'linear-gradient(180deg, #eee7d6 0%, #e7e0cd 100%)',
      'linear-gradient(180deg, #efe7d3 0%, #ecdfc4 100%)',
      'linear-gradient(180deg, #f3e7cb 0%, #e9d4a8 100%)',
    ],
  );

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background }}
    />
  );
}
