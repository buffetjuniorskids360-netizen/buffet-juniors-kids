// Design System Constants - Buffet Junior's Kids Premium Enterprise Edition

// Premium Color Palette with Semantic Meaning
export const COLORS = {
  // Primary Gradient Colors
  BLUE_PRIMARY: '#1E40AF',
  PURPLE_VIBRANT: '#7C3AED', 
  INDIGO_DEEP: '#4F46E5',
  
  // Success & Growth Colors
  GREEN_SUCCESS: '#059669',
  EMERALD_BRIGHT: '#10B981',
  TEAL_FRESH: '#0D9488',
  
  // Alert & Warning Colors
  ORANGE_ALERT: '#EA580C',
  AMBER_WARNING: '#F59E0B',
  RED_DANGER: '#DC2626',
  
  // Premium Neutrals
  SLATE_50: '#f8fafc',
  SLATE_100: '#f1f5f9',
  SLATE_200: '#e2e8f0',
  SLATE_300: '#cbd5e1',
  SLATE_400: '#94a3b8',
  SLATE_500: '#64748b',
  SLATE_600: '#475569',
  SLATE_700: '#334155',
  SLATE_800: '#1e293b',
  SLATE_900: '#0f172a',
  
  // Glass Morphism & Backdrop Colors
  WHITE_GLASS: 'rgba(255, 255, 255, 0.8)',
  WHITE_GLASS_LIGHT: 'rgba(255, 255, 255, 0.6)',
  DARK_GLASS: 'rgba(15, 23, 42, 0.8)',
} as const;

// Icon Color Coding for Semantic Meaning
export const ICON_COLORS = {
  // Information & Navigation
  INFO: '#1E40AF', // Blue
  NAVIGATION: '#7C3AED', // Purple
  
  // Success & Positive Actions
  SUCCESS: '#059669', // Green
  CONFIRMED: '#10B981', // Emerald
  GROWTH: '#0D9488', // Teal
  
  // Alerts & Warnings
  WARNING: '#F59E0B', // Amber
  ALERT: '#EA580C', // Orange
  DANGER: '#DC2626', // Red
  
  // Neutral States
  NEUTRAL: '#64748b', // Slate-500
  MUTED: '#94a3b8', // Slate-400
} as const;

// Premium Typography Hierarchy
export const TYPOGRAPHY = {
  // Main Headlines - RADICAL size reduction for high-density dashboard
  h1: "text-2xl font-bold text-slate-900 tracking-tight leading-tight",
  h2: "text-xl font-semibold text-slate-900 tracking-tight leading-tight", 
  h3: "text-lg font-semibold text-slate-800 leading-tight",
  
  // Section Headers - Compact professional sizes
  sectionHeader: "text-sm font-semibold text-slate-800 tracking-wide",
  cardTitle: "text-xs font-medium text-slate-700",
  
  // Body Text with Proper Contrast - Reduced for density
  body: "text-sm font-medium text-slate-600 leading-relaxed",
  bodySmall: "text-xs font-medium text-slate-600 leading-relaxed",
  
  // Labels & UI Elements - RADICAL reduction
  label: "text-xs font-medium text-slate-700",
  caption: "text-xs font-normal text-slate-500 tracking-wide",
  badge: "text-xs font-semibold tracking-wider uppercase",
  
  // Premium Accents - Professional dashboard sizes
  highlight: "text-base font-bold text-slate-900",
  subtext: "text-xs text-slate-500 leading-relaxed",
} as const;

// Enterprise Premium Card Styles with Enhanced Visual Depth
export const CARD_STYLES = {
  // Primary Enterprise Card with Enhanced Depth - RADICAL compact p-2 padding
  primary: "border border-gray-100 shadow-sm hover:shadow-md bg-white rounded-lg p-2 transition-all duration-300",
  
  // Glass Morphism Effect
  glass: "border border-gray-100/50 shadow-md bg-white/60 backdrop-blur-md hover:bg-white/70 transition-all duration-300 rounded-lg p-2",
  
  // Gradient Cards with Better Definition
  gradient: "border border-gray-100 shadow-sm bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-lg p-2",
  gradientHover: "hover:from-blue-100/80 hover:to-purple-100/80 hover:shadow-md",
  
  // Premium with Enhanced Depth
  premium: "border border-gray-100 shadow-md bg-white rounded-lg ring-1 ring-slate-200/50 hover:shadow-lg transition-all duration-300 p-2",
  
  // Interactive Cards with Proper Enterprise Feel
  interactive: "border border-gray-100 shadow-sm bg-white hover:shadow-md hover:scale-[1.01] transition-all duration-300 rounded-lg cursor-pointer p-2",
  
  // Metric Cards for Dashboard - RADICAL h-16 height with p-2 padding for high-density
  metric: "border border-gray-100 shadow-sm bg-white rounded-lg p-2 hover:shadow-md transition-all duration-300 h-16 flex flex-col justify-between",
  
  // Premium Chart Cards
  chart: "border border-gray-100 shadow-md bg-white rounded-lg backdrop-blur-sm hover:shadow-lg transition-all duration-300 p-3",
} as const;

// Premium Gradient System
export const GRADIENTS = {
  // Primary Gradients
  primary: "bg-gradient-to-r from-blue-600 to-purple-600",
  primaryHover: "hover:from-blue-700 hover:to-purple-700",
  primarySubtle: "bg-gradient-to-br from-blue-50 to-purple-50",
  
  // Sidebar Premium Gradient
  sidebar: "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
  sidebarOverlay: "bg-gradient-to-b from-black/20 to-transparent",
  
  // Success Gradients
  success: "bg-gradient-to-r from-green-500 to-emerald-600",
  successHover: "hover:from-green-600 hover:to-emerald-700",
  
  // Alert Gradients
  alert: "bg-gradient-to-r from-orange-500 to-red-600",
  alertHover: "hover:from-orange-600 hover:to-red-700",
  
  // Glass Morphism Backgrounds
  glassLight: "bg-gradient-to-br from-white/60 to-white/40",
  glassDark: "bg-gradient-to-br from-slate-800/60 to-slate-900/40",
} as const;

// Status Badges
export const STATUS_BADGES = {
  confirmado: "bg-green-100 text-green-800 border-green-200",
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  cancelado: "bg-red-100 text-red-800 border-red-200",
  agendado: "bg-blue-100 text-blue-800 border-blue-200",
} as const;

// Breakpoints Responsivos
export const BREAKPOINTS = {
  mobile: "base", // < 640px
  tablet: "md:",  // 768px+
  desktop: "lg:", // 1024px+
  wide: "xl:",    // 1280px+
} as const;

// Enterprise-Level Premium Spacing System - Generous Breathing Room
export const SPACING = {
  // Container Padding with Premium Touch Targets - RADICAL reduction for density
  containerPadding: "p-2 lg:p-4", // High-density professional padding
  containerPaddingMobile: "p-2",
  containerPaddingLarge: "p-4 lg:p-6",
  
  // Section Gaps for Visual Hierarchy - Massive reduction
  sectionGap: "space-y-4 lg:space-y-6",
  sectionGapLarge: "space-y-6 lg:space-y-8",
  
  // Card Padding for Premium Feel - RADICAL p-2 for high-density
  cardPadding: "p-2", // Professional high-density card padding
  cardPaddingLarge: "p-3 lg:p-4",
  
  // Button Padding (Minimum 44px touch targets)
  buttonPadding: "px-6 py-3 min-h-[44px]",
  buttonPaddingLarge: "px-8 py-4 min-h-[48px]",
  
  // Consistent Gaps Between Elements - RADICAL spacing reduction
  elementGap: "gap-2", // High-density professional grid spacing
  elementGapSmall: "gap-1 lg:gap-2",
  elementGapLarge: "gap-3 lg:gap-4",
  
  // Vertical Spacing - Massive reduction for density
  verticalSpacing: "space-y-3 lg:space-y-4",
  verticalSpacingLarge: "space-y-4 lg:space-y-6",
  
  // Sidebar Specific Spacing - Enterprise Navigation
  sidebarLogoPadding: "p-6", // Increased logo section breathing room
  sidebarUserPadding: "py-6 px-4", // User profile section spacing
  sidebarNavHeight: "h-12", // Navigation items height for accessibility - CRITICAL FIX
  sidebarNavPadding: "px-4 py-3", // Navigation items internal spacing
  sidebarNavGap: "space-y-2", // Gap between navigation sections
  
  // Dashboard Specific Spacing - RADICAL reduction for professional density
  dashboardHeaderMargin: "mb-6", // Perfect header separation for enterprise dashboard
  dashboardSectionSpacing: "space-y-6 lg:space-y-8",
  dashboardCardsGrid: "gap-2", // RADICAL compact spacing for high-density layout
  
  // Header and Title Spacing
  headerPadding: "py-4", // Breadcrumb proper spacing
  titleMargin: "mb-2", // Title bottom spacing - CRITICAL FIX
  subtitleMargin: "mb-6", // Subtitle bottom spacing - CRITICAL FIX
  
  // Typography Spacing
  lineHeightRelaxed: "leading-relaxed", // Better readability - CRITICAL FIX
  
  // Card Internal Spacing
  cardInternalSpacing: "space-y-2", // Number and label spacing within cards - CRITICAL FIX
  
  // Card Heights for Consistency - RADICAL reduction for professional density
  cardHeightStandard: "h-16", // RADICAL compact metric card height
  cardHeightTall: "h-18", // Professional high-density card height
} as const;

// Informações do Sistema
export const SYSTEM_INFO = {
  name: "Sistema Financeiro Buffet Junior's Kids",
  version: "1.0.0",
  releaseDate: "Agosto 2025",
  developer: "Bryan",
  technologies: [
    { name: "React 18+", icon: "⚛️", color: "blue" },
    { name: "TypeScript", icon: "📘", color: "blue" },
    { name: "Tailwind CSS", icon: "🎨", color: "purple" },
    { name: "shadcn/ui", icon: "🧩", color: "green" },
    { name: "Framer Motion", icon: "🎬", color: "orange" },
    { name: "Lucide React", icon: "✨", color: "purple" },
    { name: "Neon PostgreSQL", icon: "🗄️", color: "green" },
    { name: "Drizzle ORM", icon: "🔧", color: "blue" }
  ],
  modules: [
    { 
      name: "Dashboard Financeiro", 
      icon: "BarChart3", 
      desc: "Métricas em tempo real e KPIs",
      color: "blue"
    },
    { 
      name: "Agenda de Eventos", 
      icon: "Calendar", 
      desc: "Calendário visual e interativo",
      color: "purple" 
    },
    { 
      name: "Gestão de Clientes", 
      icon: "Users", 
      desc: "CRUD completo com histórico",
      color: "green"
    },
    { 
      name: "Controle de Pagamentos", 
      icon: "CreditCard", 
      desc: "Fluxo de caixa e inadimplência",
      color: "blue"
    },
    { 
      name: "Gestão de Despesas", 
      icon: "Receipt", 
      desc: "Categorização e controle orçamentário",
      color: "orange"
    },
    { 
      name: "Documentos", 
      icon: "FileText", 
      desc: "Upload seguro e organização",
      color: "purple"
    }
  ]
} as const;