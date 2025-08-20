import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  BarChart3,
  Calendar,
  Users,
  CreditCard,
  FileText,
  Receipt,
  Info,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
  CalendarDays,
  TrendingUp,
  Home,
  Crown,
  Sparkles,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sidebarVariants, mobileSidebarVariants, itemVariants, buttonVariants } from '@/lib/animations';
import { COLORS, CARD_STYLES, GRADIENTS, SPACING, TYPOGRAPHY, ICON_COLORS } from '@/lib/constants';
import { useState, useEffect } from 'react';

// Premium Navigation Items with Semantic Color Coding
const navigationItems = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    icon: BarChart3,
    gradient: 'from-blue-500 to-blue-600',
    description: 'Visão geral financeira',
    iconColor: ICON_COLORS.INFO,
    category: 'analytics'
  },
  {
    id: 'agenda',
    name: 'Agenda',
    path: '/agenda',
    icon: CalendarDays,
    gradient: 'from-purple-500 to-purple-600',
    description: 'Central de eventos',
    iconColor: ICON_COLORS.NAVIGATION,
    category: 'management'
  },
  {
    id: 'calendar',
    name: 'Calendário',
    path: '/calendar',
    icon: Calendar,
    gradient: 'from-indigo-500 to-indigo-600',
    description: 'Visão em calendário',
    iconColor: ICON_COLORS.INFO,
    category: 'visualization'
  },
  {
    id: 'clients',
    name: 'Clientes',
    path: '/clients',
    icon: Users,
    gradient: 'from-green-500 to-green-600',
    description: 'Gestão de clientes',
    iconColor: ICON_COLORS.SUCCESS,
    category: 'management'
  },
  {
    id: 'cashflow',
    name: 'Fluxo de Caixa',
    path: '/cashflow',
    icon: CreditCard,
    gradient: 'from-emerald-500 to-emerald-600',
    description: 'Controle financeiro',
    iconColor: ICON_COLORS.SUCCESS,
    category: 'finance'
  },
  {
    id: 'reports',
    name: 'Relatórios',
    path: '/reports',
    icon: Receipt,
    gradient: 'from-orange-500 to-orange-600',
    description: 'Analytics e insights',
    iconColor: ICON_COLORS.WARNING,
    category: 'analytics'
  },
  {
    id: 'documents',
    name: 'Documentos',
    path: '/documents',
    icon: FileText,
    gradient: 'from-teal-500 to-teal-600',
    description: 'Arquivos e contratos',
    iconColor: ICON_COLORS.INFO,
    category: 'storage'
  }
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export function Sidebar({ isOpen, onToggle, isCollapsed, onCollapseToggle }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile and handle resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-close on mobile if open
      if (mobile && isOpen) {
        onToggle();
      }
    };

    // Initial check
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isOpen, onToggle]);

  // Debug: Log sidebar state (remove in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sidebar State:', { 
        isOpen, 
        isCollapsed, 
        isMobile, 
        screenWidth: window.innerWidth 
      });
    }
  }, [isOpen, isCollapsed, isMobile]);

  const handleNavigation = (path: string) => {
    setLocation(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Dynamic width classes for mobile and desktop - Optimized for space efficiency
  const sidebarWidth = isCollapsed ? 'w-15' : 'w-72';

  return (
    <>
      {/* Mobile Overlay - Only show on mobile when sidebar is open */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={isMobile ? mobileSidebarVariants : undefined}
        initial={isMobile ? "closed" : false}
        animate={isMobile ? (isOpen ? "open" : "closed") : false}
        className={cn(
          // Clean white background with subtle border
          "h-screen bg-white border-r border-slate-200 shadow-lg",
          // Always use fixed positioning
          "fixed top-0 left-0 z-50",
          // Hide on mobile when closed, always show on desktop
          isMobile && !isOpen ? "hidden" : "block",
          sidebarWidth,
          "transition-all duration-300 ease-in-out"
        )}
        style={{
          // Ensure no transforms override positioning
          transform: 'none'
        }}
      >
        {/* Header with Premium Spacing - Enterprise p-6 */}
        <div className={cn(
          "flex items-center justify-between border-b border-slate-100",
          SPACING.sidebarLogoPadding
        )}>
          {!isCollapsed && (
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3"
            >
              {/* Premium Crown Logo with Sparkle Effects */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-xl relative overflow-hidden" style={{ width: '32px', height: '32px' }}>
                  {/* Sparkle background animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
                  <Crown className="w-5 h-5 text-white drop-shadow-sm" style={{ width: '20px', height: '20px' }} />
                  {/* Floating sparkles */}
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-200 animate-pulse" />
                  <Star className="absolute -bottom-1 -left-1 w-2 h-2 text-yellow-300 animate-pulse delay-300" />
                </div>
              </div>
              <div className="ml-4 space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Buffet Jr's</h2>
                <p className="text-sm text-slate-600 font-medium">Premium Financial System</p>
              </div>
            </motion.div>
          )}
          
          {isCollapsed && (
            <motion.div
              variants={itemVariants}
              className="relative mx-auto flex justify-center"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg" />
                <Crown className="w-4 h-4 text-white drop-shadow-sm" />
                <Sparkles className="absolute -top-0.5 -right-0.5 w-2 h-2 text-yellow-200 animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* Desktop Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapseToggle}
            className="hidden lg:flex h-10 w-10 p-0 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors rounded-lg"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>

          {/* Mobile Close */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden h-10 w-10 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* User Section - Enterprise spacing py-6 px-4 */}
        {!isCollapsed && (
          <motion.div
            variants={itemVariants}
            className={cn(
              "border-b border-slate-100",
              SPACING.sidebarUserPadding
            )}
          >
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/50 shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <span className="text-base font-semibold text-blue-700">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-slate-900 truncate">
                  {user?.username}
                </p>
                <p className="text-sm text-slate-600 capitalize mt-0.5 font-medium">
                  {user?.role}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg" />
            </div>
          </motion.div>
        )}

        {/* Premium Navigation - Enterprise spacing with space-y-2 */}
        <nav className={cn(
          "flex-1 overflow-y-auto",
          SPACING.sidebarLogoPadding,
          SPACING.sidebarNavGap
        )}>
          <motion.div
            variants={itemVariants}
            className={SPACING.sidebarNavGap}
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              const isHovered = hoveredItem === item.id;

              return (
                <motion.div
                  key={item.id}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                >
                  <Button
                    data-nav-item={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start transition-all duration-300 min-h-[44px]",
                      SPACING.sidebarNavHeight, // h-12 for proper navigation height
                      SPACING.sidebarNavPadding, // px-4 py-3 for proper internal spacing
                      isActive && [
                        "bg-blue-50 shadow-md text-blue-900 border border-blue-200",
                        "hover:bg-blue-100"
                      ],
                      !isActive && [
                        "hover:bg-slate-100 text-slate-700 hover:text-slate-900",
                        isHovered && "bg-slate-50"
                      ]
                    )}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <div className={cn(
                      "flex items-center gap-5",
                      isCollapsed && "justify-center"
                    )}>
                      <Icon className={cn(
                        "h-6 w-6 transition-all duration-300 flex-shrink-0",
                        isActive && "text-blue-700",
                        !isActive && "text-slate-600",
                        isHovered && "scale-110 text-slate-900"
                      )} 
                        style={{
                          color: !isActive && !isHovered ? item.iconColor : undefined
                        }}
                      />
                      {!isCollapsed && (
                        <div className="flex-1 text-left">
                          <p className={cn(
                            "text-base font-semibold leading-tight",
                            isActive && "text-blue-900",
                            !isActive && "text-slate-700"
                          )}>
                            {item.name}
                          </p>
                          <p className={cn(
                            "text-sm mt-1 leading-tight",
                            isActive && "text-blue-700",
                            !isActive && "text-slate-500"
                          )}>
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </Button>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="fixed left-15 bg-black/80 backdrop-blur-md text-white text-sm px-4 py-3 rounded-xl shadow-2xl z-50 pointer-events-none ml-2 border border-white/20"
                      style={{
                        top: `${document.querySelector(`[data-nav-item="${item.id}"]`)?.getBoundingClientRect().top || 0}px`
                      }}
                    >
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-white/70 text-xs">{item.description}</div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </nav>

        {/* Premium Footer - Consistent with white sidebar theme */}
        <div className={cn(
          "border-t border-slate-100 space-y-4 relative z-10",
          SPACING.sidebarLogoPadding
        )}>
          {/* About Button - Clean white sidebar styling */}
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300 min-h-[44px]",
                SPACING.sidebarNavHeight,
                SPACING.sidebarNavPadding
              )}
              onClick={() => handleNavigation('/about')}
            >
              <div className={cn(
                "flex items-center gap-4",
                isCollapsed && "justify-center"
              )}>
                <Info className="h-5 w-5" style={{ color: ICON_COLORS.INFO }} />
                {!isCollapsed && <span className="text-sm font-medium">Sobre o Sistema</span>}
              </div>
            </Button>
          </motion.div>

          {/* Logout Button - Clean white sidebar styling */}
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 min-h-[44px]",
                SPACING.sidebarNavHeight,
                SPACING.sidebarNavPadding
              )}
              onClick={handleLogout}
            >
              <div className={cn(
                "flex items-center gap-4",
                isCollapsed && "justify-center"
              )}>
                <LogOut className="h-5 w-5" style={{ color: ICON_COLORS.DANGER }} />
                {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
              </div>
            </Button>
          </motion.div>

          {/* Version Info - Clean white sidebar styling */}
          {!isCollapsed && (
            <motion.div
              variants={itemVariants}
              className="pt-4 text-center"
            >
              <p className="text-xs text-slate-500 font-medium">v1.0.0 - Agosto 2025</p>
              <p className="text-xs text-slate-500 font-medium">by Bryan</p>
            </motion.div>
          )}
        </div>
      </motion.aside>
    </>
  );
}

// Premium Mobile Menu Toggle Button
export function MobileMenuButton({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="lg:hidden h-10 w-10 p-0 hover:bg-slate-100 rounded-xl shadow-lg bg-white/80 backdrop-blur-sm border-0 min-h-[44px]"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-slate-700" />
        ) : (
          <Menu className="h-5 w-5 text-slate-700" />
        )}
      </Button>
    </motion.div>
  );
}