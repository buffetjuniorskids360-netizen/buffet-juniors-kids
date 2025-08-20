import { useState, useEffect, createContext, useContext } from 'react';

// Navigation State Interface
interface NavigationState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  activeRoute: string;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setActiveRoute: (route: string) => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

// Navigation Context
const NavigationContext = createContext<NavigationState | undefined>(undefined);

// Custom hook for navigation state
export function useNavigation(): NavigationState {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

// Navigation state hook (for provider)
export function useNavigationState(): NavigationState {
  // Initialize sidebar open state based on screen size
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Always start with sidebar open on desktop for immediate visibility
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    // Default to true for SSR safety (will be corrected on mount)
    return true;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeRoute, setActiveRoute] = useState('/dashboard');

  // Initialize sidebar state based on screen size and localStorage
  useEffect(() => {
    // Set initial sidebar open state based on screen size
    const isDesktop = window.innerWidth >= 1024;
    setIsSidebarOpen(isDesktop);

    // Get saved preferences for collapsed state
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed !== null) {
      setIsSidebarCollapsed(JSON.parse(savedCollapsed));
    } else {
      // Default: collapse on smaller screens
      setIsSidebarCollapsed(window.innerWidth < 1280);
    }

    // Handle screen size changes
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      
      // Auto-close sidebar on mobile
      if (currentWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        // Auto-open sidebar on desktop
        setIsSidebarOpen(true);
      }
      
      // Auto-collapse on medium screens
      if (currentWidth < 1280 && currentWidth >= 1024) {
        setIsSidebarCollapsed(true);
      } else if (currentWidth >= 1280) {
        // Auto-expand on larger screens if not manually collapsed
        const savedCollapsed = localStorage.getItem('sidebar-collapsed');
        if (savedCollapsed === null) {
          setIsSidebarCollapsed(false);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  return {
    isSidebarOpen,
    isSidebarCollapsed,
    activeRoute,
    toggleSidebar,
    toggleSidebarCollapse,
    setActiveRoute,
    closeSidebar,
    openSidebar
  };
}

// Navigation Provider Component
export { NavigationContext };

// Utility hook for responsive behavior
export function useResponsiveNavigation() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    showMobileMenu: isMobile || isTablet,
    showDesktopSidebar: isDesktop
  };
}

// Hook for keyboard navigation
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        // You can dispatch a custom event or use a global state manager
        window.dispatchEvent(new CustomEvent('toggle-sidebar'));
      }

      // Escape to close sidebar on mobile
      if (event.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('close-sidebar'));
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);
}

// Route-based navigation utilities
export function getRouteInfo(path: string) {
  const routeMap: Record<string, { title: string; breadcrumb: string[]; requiresAuth: boolean }> = {
    '/dashboard': {
      title: 'Dashboard Financeiro',
      breadcrumb: ['Dashboard'],
      requiresAuth: true
    },
    '/agenda': {
      title: 'Central de Eventos',
      breadcrumb: ['Agenda', 'Eventos'],
      requiresAuth: true
    },
    '/calendar': {
      title: 'Calendário Visual',
      breadcrumb: ['Calendário'],
      requiresAuth: true
    },
    '/clients': {
      title: 'Gestão de Clientes',
      breadcrumb: ['Clientes'],
      requiresAuth: true
    },
    '/cashflow': {
      title: 'Fluxo de Caixa',
      breadcrumb: ['Financeiro', 'Fluxo de Caixa'],
      requiresAuth: true
    },
    '/reports': {
      title: 'Relatórios e Analytics',
      breadcrumb: ['Relatórios'],
      requiresAuth: true
    },
    '/documents': {
      title: 'Documentos e Arquivos',
      breadcrumb: ['Documentos'],
      requiresAuth: true
    },
    '/about': {
      title: 'Sobre o Sistema',
      breadcrumb: ['Sistema', 'Sobre'],
      requiresAuth: true
    },
    '/login': {
      title: 'Login',
      breadcrumb: ['Login'],
      requiresAuth: false
    }
  };

  return routeMap[path] || {
    title: 'Página não encontrada',
    breadcrumb: ['404'],
    requiresAuth: false
  };
}

// Analytics for navigation
export function useNavigationAnalytics() {
  const trackNavigation = (from: string, to: string, method: 'click' | 'keyboard' | 'programmatic' = 'click') => {
    // You can integrate with analytics services here
    console.log(`Navigation: ${from} -> ${to} (${method})`);
    
    // Track navigation patterns for UX improvements
    const navigationData = {
      timestamp: new Date().toISOString(),
      from,
      to,
      method,
      userAgent: navigator.userAgent,
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    // Store in localStorage for now (you can send to analytics service)
    const existing = JSON.parse(localStorage.getItem('navigation-analytics') || '[]');
    existing.push(navigationData);
    
    // Keep only last 100 entries
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    
    localStorage.setItem('navigation-analytics', JSON.stringify(existing));
  };

  const getNavigationStats = () => {
    const data = JSON.parse(localStorage.getItem('navigation-analytics') || '[]');
    
    // Calculate most visited routes
    const routeCounts = data.reduce((acc: Record<string, number>, item: any) => {
      acc[item.to] = (acc[item.to] || 0) + 1;
      return acc;
    }, {});

    // Calculate navigation patterns
    const patterns = data.reduce((acc: Record<string, number>, item: any) => {
      const pattern = `${item.from} -> ${item.to}`;
      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {});

    return {
      totalNavigations: data.length,
      mostVisited: Object.entries(routeCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5),
      commonPatterns: Object.entries(patterns)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
    };
  };

  return {
    trackNavigation,
    getNavigationStats
  };
}