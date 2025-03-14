import { motion } from "framer-motion";

// Shared page transition variants
export const pageTransitionVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  animate: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0
  })
};

// Shared transition settings
export const pageTransition = {
  type: "tween",
  duration: 0.2,
  ease: "easeInOut"
};

// Shared container for page transitions
export const PageTransition = ({ 
  children, 
  direction = 1 // 1 for forward, -1 for backward
}: { 
  children: React.ReactNode;
  direction?: number;
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
      transition={pageTransition}
      custom={direction}
      style={{
        width: '100%',
        height: '100%',
        background: 'hsl(var(--background))',
        zIndex: 10,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {children}
    </motion.div>
  );
};

// Card animation variants
export const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  hover: { scale: 1.02, transition: { duration: 0.2 } }
};

// Media preview animation variants
export const mediaPreviewVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};