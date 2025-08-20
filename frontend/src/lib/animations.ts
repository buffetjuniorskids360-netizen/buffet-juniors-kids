// Framer Motion Animations - Buffet Junior's Kids Design System

import { Variants, Transition } from 'framer-motion';

// Mobile-responsive animation utilities
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;
const isTablet = () => typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Enhanced Premium Page Transitions (Mobile Optimized)
export const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: isMobile() ? 16 : 32, // Reduced movement on mobile
    scale: isMobile() ? 0.98 : 0.96 // Less dramatic scale on mobile
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: prefersReducedMotion() ? 0.01 : isMobile() ? 0.4 : 0.6, // Respect motion preferences
      ease: [0.25, 0.46, 0.45, 0.94], // Premium easing curve
      staggerChildren: prefersReducedMotion() ? 0 : isMobile() ? 0.05 : 0.08 // Faster stagger on mobile
    }
  },
  exit: { 
    opacity: 0, 
    y: isMobile() ? -12 : -24, // Reduced movement on mobile
    scale: isMobile() ? 0.99 : 0.98, // Less dramatic scale on mobile
    transition: {
      duration: prefersReducedMotion() ? 0.01 : isMobile() ? 0.3 : 0.4, // Faster on mobile
      ease: [0.4, 0, 1, 1]
    }
  }
};

export const pageTransition: Transition = {
  duration: prefersReducedMotion() ? 0.01 : isMobile() ? 0.4 : 0.6, // Faster on mobile, respect motion preferences
  ease: [0.25, 0.46, 0.45, 0.94] // Premium easing for smooth feel
};

// Enhanced Staggered Element Entry
export const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15
    }
  }
};

export const itemVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 28,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Enhanced Micro-interactions for Premium Feel (Mobile Optimized)
export const cardHoverVariants: Variants = {
  rest: { 
    scale: 1,
    rotateY: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
  },
  hover: { 
    scale: prefersReducedMotion() ? 1 : isMobile() ? 1.015 : 1.03, // No scale if reduced motion
    rotateY: prefersReducedMotion() ? 0 : isMobile() ? 1 : 2, // No rotation if reduced motion
    boxShadow: prefersReducedMotion() 
      ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      : "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)",
    transition: {
      duration: prefersReducedMotion() ? 0.01 : isMobile() ? 0.2 : 0.3, // Respect motion preferences
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  tap: {
    scale: prefersReducedMotion() ? 1 : 0.98, // No scale if reduced motion
    transition: {
      duration: prefersReducedMotion() ? 0.01 : 0.1,
      ease: "easeInOut"
    }
  }
};

export const buttonVariants: Variants = {
  rest: { 
    scale: 1,
    rotateZ: 0
  },
  hover: { 
    scale: prefersReducedMotion() ? 1 : isMobile() ? 1.02 : 1.05, // No scale if reduced motion
    rotateZ: prefersReducedMotion() ? 0 : isMobile() ? 0.5 : 1, // No rotation if reduced motion
    transition: {
      duration: prefersReducedMotion() ? 0.01 : isMobile() ? 0.15 : 0.25, // Respect motion preferences
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  tap: { 
    scale: prefersReducedMotion() ? 1 : 0.96, // No scale if reduced motion
    rotateZ: 0,
    transition: {
      duration: prefersReducedMotion() ? 0.01 : 0.1,
      ease: "easeInOut"
    }
  }
};

// Animações de Modal/Dialog
export const modalVariants: Variants = {
  initial: { 
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  animate: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.15,
      ease: "easeIn"
    }
  }
};

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.2
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.15
    }
  }
};

// Animações de Lista/Tabela
export const listVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const listItemVariants: Variants = {
  initial: { 
    opacity: 0, 
    x: -20 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Animações de Carregamento
export const skeletonVariants: Variants = {
  initial: { opacity: 0.6 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

// Animações de Notificação/Toast
export const toastVariants: Variants = {
  initial: { 
    opacity: 0,
    y: -100,
    scale: 0.95
  },
  animate: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    y: -100,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// Animações de Sidebar/Menu
export const sidebarVariants: Variants = {
  closed: { 
    x: "-100%",
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  open: { 
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

// Mobile-only sidebar variants (for responsive behavior)
export const mobileSidebarVariants: Variants = {
  closed: { 
    x: "-100%",
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  open: { 
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

// Desktop sidebar variants (always visible, only width changes)
export const desktopSidebarVariants: Variants = {
  expanded: { 
    width: "18rem", // w-72
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  collapsed: { 
    width: "5rem", // w-20
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

// Transições Customizadas
export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

export const smoothTransition: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] // Cubic bezier ease-out
};

// Configurações de Scroll
export const scrollAnimationVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 30
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// Animações para Estados Vazios
export const emptyStateVariants: Variants = {
  initial: { 
    opacity: 0,
    scale: 0.9
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: 0.2
    }
  }
};

// Form Input Animations
export const inputVariants: Variants = {
  initial: { 
    borderColor: 'rgba(226, 232, 240, 1)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  focus: { 
    borderColor: 'rgba(59, 130, 246, 1)',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  error: {
    borderColor: 'rgba(239, 68, 68, 1)',
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  success: {
    borderColor: 'rgba(34, 197, 94, 1)',
    boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

// Number Counting Animation
export const numberCountVariants: Variants = {
  initial: { 
    scale: 1,
    color: 'rgba(100, 116, 139, 1)'
  },
  update: { 
    scale: [1, 1.1, 1],
    color: ['rgba(100, 116, 139, 1)', 'rgba(59, 130, 246, 1)', 'rgba(100, 116, 139, 1)'],
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  }
};

// Success/Error Feedback Animations
export const feedbackVariants: Variants = {
  success: {
    scale: [1, 1.2, 1],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  },
  error: {
    x: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
};

// Chart Loading Animation
export const chartLoadingVariants: Variants = {
  initial: { 
    opacity: 0,
    scale: 0.9
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: 0.2
    }
  }
};

// Progressive Reveal for Lists
export const progressiveListVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const progressiveItemVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// Tooltip Animations
export const tooltipVariants: Variants = {
  initial: { 
    opacity: 0,
    scale: 0.9,
    y: 5
  },
  animate: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    y: 5,
    transition: {
      duration: 0.1,
      ease: "easeIn"
    }
  }
};

// Loading Pulse Animation
export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Enhanced Shimmer Animation for Premium Loading
export const shimmerVariants: Variants = {
  initial: { 
    opacity: 0.6,
    backgroundPosition: "-200% 0"
  },
  animate: { 
    opacity: [0.6, 1, 0.6],
    backgroundPosition: "200% 0",
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Wave Loading Animation
export const waveVariants: Variants = {
  initial: { 
    scale: 1,
    opacity: 0.3
  },
  animate: { 
    scale: [1, 1.1, 1],
    opacity: [0.3, 0.8, 0.3],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Breathing Animation for Loading States
export const breatheVariants: Variants = {
  initial: { 
    scale: 1,
    opacity: 0.7
  },
  animate: { 
    scale: [1, 1.02, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Progressive Loading Bar
export const progressVariants: Variants = {
  initial: { 
    width: "0%",
    opacity: 0
  },
  animate: { 
    width: "100%",
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: "easeOut"
    }
  }
};

// Skeleton Loading with Gradient Shift
export const gradientShiftVariants: Variants = {
  initial: { 
    backgroundPosition: "-100% 0"
  },
  animate: { 
    backgroundPosition: "100% 0",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Staggered Loading for Lists/Grids
export const staggeredLoadingVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

export const staggeredItemVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 30,
    scale: 0.8
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// Loading Dots Animation
export const dotsVariants: Variants = {
  initial: { opacity: 0.3 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

// Skeleton Bar Animation (for charts/graphs)
export const skeletonBarVariants: Variants = {
  initial: { 
    height: "0%",
    opacity: 0.6
  },
  animate: { 
    height: ["0%", "60%", "100%", "80%", "90%"],
    opacity: [0.6, 0.8, 1, 0.8, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Content Fade In
export const contentFadeInVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 15
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Loading State Transition
export const loadingStateVariants: Variants = {
  loading: {
    opacity: 0.7,
    pointerEvents: "none" as any,
    transition: {
      duration: 0.2
    }
  },
  loaded: {
    opacity: 1,
    pointerEvents: "auto" as any,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Floating Action Button
export const fabVariants: Variants = {
  initial: { 
    scale: 0,
    rotate: -180
  },
  animate: { 
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay: 0.3
    }
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeInOut"
    }
  }
};

// Notification Animation
export const notificationVariants: Variants = {
  initial: { 
    opacity: 0,
    x: 300,
    scale: 0.8
  },
  animate: { 
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    opacity: 0,
    x: 300,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// Page Transition Variants
export const slidePageVariants: Variants = {
  initial: { 
    opacity: 0,
    x: 100
  },
  animate: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1]
    }
  }
};

// Enhanced Button Animations
export const enhancedButtonVariants: Variants = {
  rest: { 
    scale: 1,
    backgroundColor: 'var(--original-bg)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  hover: { 
    scale: 1.02,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeInOut"
    }
  },
  loading: {
    opacity: 0.7,
    transition: {
      duration: 0.2
    }
  }
};

// Motion Preferences
export const motionPreferences = {
  reduceMotion: {
    transition: { duration: 0.01 },
    initial: false,
    animate: false
  }
};

// Animation Utilities
export const createStaggerAnimation = (staggerDelay: number = 0.1) => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1
    }
  }
});

export const createSlideInAnimation = (direction: 'up' | 'down' | 'left' | 'right' = 'up', distance: number = 20) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: distance };
      case 'down': return { y: -distance };
      case 'left': return { x: distance };
      case 'right': return { x: -distance };
      default: return { y: distance };
    }
  };

  return {
    initial: {
      opacity: 0,
      ...getInitialPosition()
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };
};

// Exportar configurações comuns
export const commonAnimationProps = {
  initial: "initial",
  animate: "animate",
  exit: "exit"
} as const;

// Accessibility utilities
export const respectMotionPreference = (animation: any) => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return motionPreferences.reduceMotion;
  }
  return animation;
};

// Mobile-responsive animation factory
export const createResponsiveVariants = (baseVariants: Variants): Variants => {
  const responsive: Variants = {};
  
  Object.entries(baseVariants).forEach(([key, variant]) => {
    if (typeof variant === 'object' && variant !== null) {
      responsive[key] = {
        ...variant,
        transition: {
          ...variant.transition,
          duration: prefersReducedMotion() 
            ? 0.01 
            : isMobile() 
              ? Math.min((variant.transition?.duration || 0.3) * 0.7, 0.4) 
              : variant.transition?.duration || 0.3
        }
      };
      
      // Reduce scale transforms on mobile
      if ('scale' in variant && typeof variant.scale === 'number' && variant.scale !== 1) {
        const scaleReduction = isMobile() ? 0.5 : 1;
        responsive[key] = {
          ...responsive[key],
          scale: prefersReducedMotion() 
            ? 1 
            : 1 + ((variant.scale - 1) * scaleReduction)
        };
      }
      
      // Reduce movement on mobile
      if ('y' in variant && typeof variant.y === 'number') {
        responsive[key] = {
          ...responsive[key],
          y: prefersReducedMotion() 
            ? 0 
            : isMobile() 
              ? variant.y * 0.5 
              : variant.y
        };
      }
      
      if ('x' in variant && typeof variant.x === 'number') {
        responsive[key] = {
          ...responsive[key],
          x: prefersReducedMotion() 
            ? 0 
            : isMobile() 
              ? variant.x * 0.5 
              : variant.x
        };
      }
      
      // Reduce or eliminate rotations on mobile/reduced motion
      if ('rotateY' in variant && typeof variant.rotateY === 'number') {
        responsive[key] = {
          ...responsive[key],
          rotateY: prefersReducedMotion() 
            ? 0 
            : isMobile() 
              ? variant.rotateY * 0.5 
              : variant.rotateY
        };
      }
      
      if ('rotateZ' in variant && typeof variant.rotateZ === 'number') {
        responsive[key] = {
          ...responsive[key],
          rotateZ: prefersReducedMotion() 
            ? 0 
            : isMobile() 
              ? variant.rotateZ * 0.5 
              : variant.rotateZ
        };
      }
    } else {
      responsive[key] = variant;
    }
  });
  
  return responsive;
};

// Touch-friendly mobile interaction variants
export const mobileOptimizedVariants: Variants = {
  rest: { 
    scale: 1,
    opacity: 1
  },
  tap: { 
    scale: prefersReducedMotion() ? 1 : 0.95,
    opacity: prefersReducedMotion() ? 1 : 0.8,
    transition: {
      duration: prefersReducedMotion() ? 0.01 : 0.1,
      ease: "easeInOut"
    }
  },
  // Mobile-specific hover state (lighter effect)
  hover: {
    scale: prefersReducedMotion() ? 1 : isMobile() ? 1.01 : 1.05,
    transition: {
      duration: prefersReducedMotion() ? 0.01 : isMobile() ? 0.15 : 0.2,
      ease: "easeOut"
    }
  }
};