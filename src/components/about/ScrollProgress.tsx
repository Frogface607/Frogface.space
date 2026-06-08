'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/** Thin scroll-progress rail pinned under the top nav. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-canon-olive via-canon-tan to-canon-olive"
      style={{ scaleX }}
    />
  );
}
