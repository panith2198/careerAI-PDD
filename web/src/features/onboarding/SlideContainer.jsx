import React from 'react';
import { motion } from 'framer-motion';

export default function SlideContainer({ children, direction, slideKey }) {
  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      key={slideKey}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="w-full flex flex-col gap-6"
    >
      {children}
    </motion.div>
  );
}
