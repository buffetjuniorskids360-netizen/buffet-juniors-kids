import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Sidebar, MobileMenuButton } from './Sidebar';
import { NavigationContext, useNavigationState, useKeyboardNavigation, useNavigationAnalytics, getRouteInfo } from '@/hooks/useNavigation';
import { pageVariants, pageTransition } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { SPACING, TYPOGRAPHY, CARD_STYLES } from '@/lib/constants';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const navigation = useNavigationState();
  const { trackNavigation } = useNavigationAnalytics();
  const [mainContentMargin, setMainContentMargin] = useState(0);
  
  // Enable keyboard navigation
  useKeyboardNavigation();

  // Track route changes
  useEffect(() => {
    navigation.setActiveRoute(location);
  }, [location, navigation]);

  // Listen for global sidebar events
  useEffect(() => {
    const handleToggleSidebar = () => navigation.toggleSidebar();
    const handleCloseSidebar = () => navigation.closeSidebar();

    window.addEventListener('toggle-sidebar', handleToggleSidebar);
    window.addEventListener('close-sidebar', handleCloseSidebar);

    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleSidebar);
      window.removeEventListener('close-sidebar', handleCloseSidebar);
    };
  }, [navigation]);

  // Calculate sidebar width for margin compensation
  const getSidebarWidth = () => {
    // On mobile, sidebar is overlay (no margin needed)
    if (window.innerWidth < 1024) return 0;
    
    // On desktop, sidebar is always visible but can be collapsed
    // w-15 = 60px (collapsed), w-72 = 288px (expanded)
    return navigation.isSidebarCollapsed ? 60 : 288;
  };

  // Update main content margin when sidebar state changes or window resizes
  useEffect(() => {
    const updateMargin = () => {
      setMainContentMargin(getSidebarWidth());
    };

    // Initial calculation
    updateMargin();

    // Listen for window resize
    window.addEventListener('resize', updateMargin);

    return () => {
      window.removeEventListener('resize', updateMargin);
    };
  }, [navigation.isSidebarCollapsed, navigation.isSidebarOpen]);

  const routeInfo = getRouteInfo(location);

  return (
    <NavigationContext.Provider value={navigation}>
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={navigation.isSidebarOpen}
          onToggle={navigation.toggleSidebar}
          isCollapsed={navigation.isSidebarCollapsed}
          onCollapseToggle={navigation.toggleSidebarCollapse}
        />

        {/* Main Content - Fixed positioning with margin compensation */}
        <div 
          className={cn(
            "h-screen overflow-y-auto transition-all duration-300 ease-in-out",
            "relative" // Remove min-w-0 and flex-1
          )}
          style={{
            marginLeft: `${mainContentMargin}px`
          }}
        >
        {/* Premium Top Header Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-lg">
          <div className={cn(
            "flex items-center justify-between",
            SPACING.containerPadding,
            "py-6 lg:py-8"
          )}>
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <MobileMenuButton
                isOpen={navigation.isSidebarOpen}
                onToggle={navigation.toggleSidebar}
              />

              {/* Premium Breadcrumb */}
              <nav className="flex items-center space-x-4 text-sm">
                <span className="text-slate-600 font-semibold tracking-wide">Sistema</span>
                {routeInfo.breadcrumb.map((crumb, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                    <span className={cn(
                      index === routeInfo.breadcrumb.length - 1 
                        ? "text-slate-900 font-semibold" 
                        : "text-slate-600"
                    )}>
                      {crumb}
                    </span>
                  </div>
                ))}
              </nav>
            </div>

            {/* Premium Page Title */}
            <div className="hidden md:block">
              <h1 className={cn(TYPOGRAPHY.h1)}>
                {routeInfo.title}
              </h1>
            </div>

            {/* Premium Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Quick Actions could go here */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100/80 backdrop-blur-sm rounded-full border border-green-200/50">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-green-700 tracking-wide">ONLINE</span>
              </div>
            </div>
          </div>
        </header>

        {/* Premium Page Content - Enterprise p-6 lg:p-8 spacing */}
        <main className={cn(
          "relative",
          SPACING.containerPadding, // p-6 lg:p-8 generous margins
          "pt-6 sm:pt-8 pb-8 sm:pb-10"
        )}>
          <motion.div
            key={location}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="min-h-[calc(100vh-8rem)] space-y-8"
          >
            {children}
          </motion.div>
        </main>

        {/* Premium Footer */}
        <footer className="mt-12 border-t border-slate-200/50 bg-white/60 backdrop-blur-md shadow-lg">
          <div className={cn(SPACING.containerPadding, "py-6 lg:py-8")}>
            <div className={cn(
              "flex flex-col md:flex-row items-center justify-between",
              SPACING.elementGap
            )}>
              <div className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                <span>© 2025 Buffet Junior's Kids</span>
                <span>•</span>
                <span>Sistema Financeiro v1.0.0</span>
                <span>•</span>
                <span>Desenvolvido por Bryan</span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100/60 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-700 font-semibold">Todos os serviços operacionais</span>
                </div>
                <span>•</span>
                <span>Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Premium Development Helper - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <details className="bg-slate-900/90 backdrop-blur-md text-white text-xs rounded-xl p-4 shadow-2xl border border-white/10">
            <summary className="cursor-pointer font-semibold">Layout Debug</summary>
            <div className="mt-3 space-y-2">
              <div className="font-medium">Route: <span className="text-blue-300">{location}</span></div>
              <div>Sidebar Open: <span className="text-green-300">{navigation.isSidebarOpen.toString()}</span></div>
              <div>Sidebar Collapsed: <span className="text-yellow-300">{navigation.isSidebarCollapsed.toString()}</span></div>
              <div>Main Margin: <span className="text-purple-300">{mainContentMargin}px</span></div>
              <div>Screen: <span className="text-orange-300">{window.innerWidth}x{window.innerHeight}</span></div>
              <div>Is Mobile: <span className="text-red-300">{window.innerWidth < 1024 ? 'Yes' : 'No'}</span></div>
            </div>
          </details>
        </div>
      )}
      </div>
    </NavigationContext.Provider>
  );
}

// Enhanced Layout with Navigation Context Provider
interface AppLayoutProviderProps {
  children: ReactNode;
}

export function AppLayoutProvider({ children }: AppLayoutProviderProps) {
  const navigationState = useNavigationState();

  return (
    <NavigationContext.Provider value={navigationState}>
      <AppLayout>{children}</AppLayout>
    </NavigationContext.Provider>
  );
}

// HOC for pages that need layout
export function withAppLayout<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <AppLayoutProvider>
        <Component {...props} />
      </AppLayoutProvider>
    );
  };
}

// Layout variants for different page types
interface LayoutVariant {
  showHeader?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  containerPadding?: string;
  backgroundStyle?: string;
}

const layoutVariants: Record<string, LayoutVariant> = {
  dashboard: {
    showHeader: true,
    showFooter: true,
    showSidebar: true,
    containerPadding: 'p-8',
    backgroundStyle: 'bg-slate-50'
  },
  fullscreen: {
    showHeader: false,
    showFooter: false,
    showSidebar: false,
    containerPadding: 'p-0',
    backgroundStyle: 'bg-white'
  },
  minimal: {
    showHeader: true,
    showFooter: false,
    showSidebar: true,
    containerPadding: 'p-6',
    backgroundStyle: 'bg-white'
  },
  auth: {
    showHeader: false,
    showFooter: false,
    showSidebar: false,
    containerPadding: 'p-8',
    backgroundStyle: 'bg-gradient-to-br from-blue-50 to-purple-50'
  }
};

// Custom layout component with variants
interface CustomLayoutProps extends AppLayoutProps {
  variant?: keyof typeof layoutVariants;
}

export function CustomLayout({ children, variant = 'dashboard' }: CustomLayoutProps) {
  const config = layoutVariants[variant];
  
  if (!config.showSidebar) {
    // Render without sidebar for special layouts
    return (
      <div className={cn("min-h-screen", config.backgroundStyle)}>
        {config.showHeader && (
          <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-lg">
            <div className={cn(SPACING.containerPadding, "py-6")}>
              <h1 className={cn(TYPOGRAPHY.h2)}>
                {getRouteInfo(window.location.pathname).title}
              </h1>
            </div>
          </header>
        )}
        
        <main className={cn(config.containerPadding, "pt-8 space-y-8")}>
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {children}
          </motion.div>
        </main>
        
        {config.showFooter && (
          <footer className="mt-12 border-t border-slate-200/50 bg-white/60 backdrop-blur-md">
            <div className={cn(SPACING.containerPadding, "py-6 text-center text-sm text-slate-600 font-medium")}>
              © 2025 Buffet Junior's Kids - Sistema Financeiro Premium
            </div>
          </footer>
        )}
      </div>
    );
  }

  // Default layout with sidebar
  return (
    <AppLayoutProvider>
      {children}
    </AppLayoutProvider>
  );
}