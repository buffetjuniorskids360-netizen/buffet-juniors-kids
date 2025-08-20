import { useState, useEffect } from 'react';

/**
 * Hook para detectar se o dispositivo é mobile
 * Útil para otimizar animações e interações
 */
export const useIsMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < breakpoint);
      }
    };

    // Check initial
    checkIsMobile();

    // Add resize listener
    const handleResize = () => {
      checkIsMobile();
    };

    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
};

/**
 * Hook para detectar se o usuário prefere animações reduzidas
 * Respeita as configurações de acessibilidade do sistema
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (event: MediaQueryListEvent) => {
        setPrefersReducedMotion(event.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook combinado para obter configurações de animação otimizadas
 */
export const useAnimationConfig = () => {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  return {
    isMobile,
    prefersReducedMotion,
    // Durações otimizadas baseadas no dispositivo e preferências
    duration: {
      fast: prefersReducedMotion ? 0.01 : isMobile ? 0.15 : 0.2,
      medium: prefersReducedMotion ? 0.01 : isMobile ? 0.25 : 0.4,
      slow: prefersReducedMotion ? 0.01 : isMobile ? 0.4 : 0.6,
    },
    // Escalas otimizadas para mobile
    scale: {
      small: isMobile ? 1.01 : 1.02,
      medium: isMobile ? 1.02 : 1.05,
      large: isMobile ? 1.05 : 1.1,
    },
    // Movimentos reduzidos em mobile
    movement: {
      small: isMobile ? 8 : 16,
      medium: isMobile ? 16 : 32,
      large: isMobile ? 24 : 48,
    },
    // Rotações suaves em mobile
    rotation: {
      subtle: isMobile ? 0.5 : 1,
      medium: isMobile ? 1 : 2,
      bold: isMobile ? 2 : 5,
    }
  };
};