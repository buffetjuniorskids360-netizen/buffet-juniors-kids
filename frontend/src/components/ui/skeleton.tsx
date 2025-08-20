import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { skeletonVariants, respectMotionPreference } from "@/lib/animations"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  lines?: number
  width?: string | number
  height?: string | number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animate = true, variant = 'rectangular', lines = 1, width, height, ...props }, ref) => {
    const motionProps = animate ? respectMotionPreference({
      variants: skeletonVariants,
      initial: "initial",
      animate: "animate"
    }) : {}
    
    const Component = animate ? motion.div : "div"
    
    const getVariantClasses = () => {
      switch (variant) {
        case 'text':
          return "h-4 rounded"
        case 'circular':
          return "rounded-full"
        case 'card':
          return "h-32 rounded-lg"
        default:
          return "rounded"
      }
    }
    
    const style = {
      width,
      height: variant === 'text' ? undefined : height
    }
    
    if (variant === 'text' && lines > 1) {
      return (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <Component
              key={index}
              ref={index === 0 ? ref : undefined}
              className={cn(
                "bg-slate-200 animate-pulse",
                getVariantClasses(),
                index === lines - 1 && "w-3/4", // Last line is shorter
                className
              )}
              style={style}
              {...(animate ? motionProps : {})}
              {...props}
            />
          ))}
        </div>
      )
    }
    
    return (
      <Component
        ref={ref}
        className={cn(
          "bg-slate-200",
          !animate && "animate-pulse",
          getVariantClasses(),
          className
        )}
        style={style}
        {...(animate ? motionProps : {})}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

// Pre-built skeleton components for common use cases
export const SkeletonCard: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <div className="space-y-3">
    <Skeleton variant="card" animate={animate} />
    <div className="space-y-2">
      <Skeleton variant="text" animate={animate} />
      <Skeleton variant="text" animate={animate} width="80%" />
    </div>
  </div>
)

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; animate?: boolean }> = ({ 
  rows = 5, 
  columns = 4, 
  animate = true 
}) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={`header-${index}`} variant="text" height="20px" animate={animate} />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" animate={animate} />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; animate?: boolean }> = ({ 
  size = 'md', 
  animate = true 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }
  
  return (
    <Skeleton 
      variant="circular" 
      className={sizeClasses[size]} 
      animate={animate} 
    />
  )
}

export const SkeletonButton: React.FC<{ animate?: boolean; size?: 'sm' | 'md' | 'lg' }> = ({ 
  animate = true, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-11 w-28'
  }
  
  return (
    <Skeleton 
      className={cn('rounded-md', sizeClasses[size])} 
      animate={animate} 
    />
  )
}

export const SkeletonChart: React.FC<{ animate?: boolean; height?: string }> = ({ 
  animate = true, 
  height = '200px' 
}) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton variant="text" width="150px" animate={animate} />
      <Skeleton variant="text" width="80px" animate={animate} />
    </div>
    <Skeleton height={height} className="rounded-lg" animate={animate} />
  </div>
)

export const SkeletonDashboard: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton variant="text" width="200px" height="24px" animate={animate} />
        <Skeleton variant="text" width="150px" animate={animate} />
      </div>
      <SkeletonButton animate={animate} />
    </div>
    
    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={index} animate={animate} />
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonChart animate={animate} />
      <SkeletonChart animate={animate} />
    </div>
  </div>
)

// Enhanced Complex Skeletons for Different Page Types
export const SkeletonKPIGrid: React.FC<{ 
  columns?: number;
  rows?: number; 
  animate?: boolean;
}> = ({ 
  columns = 6, 
  rows = 1,
  animate = true 
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
    {Array.from({ length: columns }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="70%" height="12px" animate={animate} />
          <Skeleton variant="circular" width="16px" height="16px" animate={animate} />
        </div>
        <Skeleton variant="text" width="50%" height="20px" animate={animate} />
        <div className="flex items-center gap-1">
          <Skeleton variant="circular" width="10px" height="10px" animate={animate} />
          <Skeleton variant="text" width="40%" height="10px" animate={animate} />
        </div>
      </div>
    ))}
  </div>
)

export const SkeletonDataTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  hasActions?: boolean;
  animate?: boolean;
}> = ({ 
  rows = 5, 
  columns = 4, 
  hasActions = true,
  animate = true 
}) => (
  <div className="bg-white rounded-lg border border-slate-200">
    {/* Table Header */}
    <div className="p-4 border-b border-slate-200">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr) ${hasActions ? 'auto' : ''}` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} variant="text" height="16px" animate={animate} />
        ))}
        {hasActions && <Skeleton variant="text" width="60px" height="16px" animate={animate} />}
      </div>
    </div>
    
    {/* Table Rows */}
    <div className="divide-y divide-slate-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr) ${hasActions ? 'auto' : ''}` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" animate={animate} />
            ))}
            {hasActions && (
              <div className="flex gap-2">
                <Skeleton variant="rectangular" width="32px" height="32px" animate={animate} />
                <Skeleton variant="rectangular" width="32px" height="32px" animate={animate} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const SkeletonCalendar: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <div className="bg-white rounded-lg border border-slate-200">
    {/* Calendar Header */}
    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton variant="rectangular" width="32px" height="32px" animate={animate} />
        <Skeleton variant="text" width="150px" height="20px" animate={animate} />
        <Skeleton variant="rectangular" width="32px" height="32px" animate={animate} />
      </div>
      <div className="flex gap-2">
        <SkeletonButton size="sm" animate={animate} />
        <SkeletonButton size="sm" animate={animate} />
      </div>
    </div>
    
    {/* Calendar Grid */}
    <div className="p-4">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="text-center p-2">
            <Skeleton variant="text" width="20px" height="12px" animate={animate} />
          </div>
        ))}
      </div>
      
      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, index) => (
          <div key={index} className="aspect-square p-2 rounded-lg border border-slate-100">
            <Skeleton variant="text" width="20px" height="12px" animate={animate} />
            {index % 4 === 0 && (
              <div className="mt-1">
                <Skeleton variant="rectangular" width="100%" height="4px" animate={animate} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const SkeletonForm: React.FC<{ 
  fields?: number;
  hasSubmit?: boolean;
  animate?: boolean;
}> = ({ 
  fields = 4, 
  hasSubmit = true,
  animate = true 
}) => (
  <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
    {/* Form Title */}
    <div className="space-y-2">
      <Skeleton variant="text" width="200px" height="24px" animate={animate} />
      <Skeleton variant="text" width="300px" height="16px" animate={animate} />
    </div>
    
    {/* Form Fields */}
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width="120px" height="16px" animate={animate} />
          <Skeleton variant="rectangular" width="100%" height="40px" animate={animate} />
        </div>
      ))}
    </div>
    
    {/* Action Buttons */}
    {hasSubmit && (
      <div className="flex gap-3 pt-4">
        <SkeletonButton animate={animate} />
        <SkeletonButton animate={animate} />
      </div>
    )}
  </div>
)

export const SkeletonModal: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
      {/* Modal Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="150px" height="20px" animate={animate} />
        <Skeleton variant="circular" width="24px" height="24px" animate={animate} />
      </div>
      
      {/* Modal Content */}
      <div className="space-y-3">
        <Skeleton variant="text" lines={3} animate={animate} />
      </div>
      
      {/* Modal Actions */}
      <div className="flex gap-2 justify-end pt-4">
        <SkeletonButton size="sm" animate={animate} />
        <SkeletonButton size="sm" animate={animate} />
      </div>
    </div>
  </div>
)

export const SkeletonCardGrid: React.FC<{ 
  cards?: number;
  columns?: number;
  animate?: boolean;
}> = ({ 
  cards = 6, 
  columns = 3,
  animate = true 
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
    {Array.from({ length: cards }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* Card Image/Media */}
        <Skeleton variant="rectangular" width="100%" height="200px" animate={animate} />
        
        {/* Card Content */}
        <div className="p-4 space-y-3">
          <Skeleton variant="text" width="80%" height="20px" animate={animate} />
          <Skeleton variant="text" lines={2} animate={animate} />
          
          {/* Card Meta */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <SkeletonAvatar size="sm" animate={animate} />
              <Skeleton variant="text" width="80px" height="12px" animate={animate} />
            </div>
            <Skeleton variant="text" width="60px" height="12px" animate={animate} />
          </div>
        </div>
      </div>
    ))}
  </div>
)

export const SkeletonSidebar: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <div className="w-72 bg-white border-r border-slate-200 p-4 space-y-6">
    {/* Logo/Brand */}
    <div className="flex items-center gap-3">
      <Skeleton variant="rectangular" width="40px" height="40px" animate={animate} />
      <Skeleton variant="text" width="120px" height="20px" animate={animate} />
    </div>
    
    {/* Navigation Items */}
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3 rounded-lg">
          <Skeleton variant="rectangular" width="20px" height="20px" animate={animate} />
          <Skeleton variant="text" width="100px" height="16px" animate={animate} />
        </div>
      ))}
    </div>
    
    {/* User Section */}
    <div className="pt-4 border-t border-slate-200">
      <div className="flex items-center gap-3">
        <SkeletonAvatar animate={animate} />
        <div className="space-y-1">
          <Skeleton variant="text" width="80px" height="14px" animate={animate} />
          <Skeleton variant="text" width="60px" height="12px" animate={animate} />
        </div>
      </div>
    </div>
  </div>
)

export const SkeletonStats: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="text-center space-y-1">
        <Skeleton variant="text" width="60%" height="16px" animate={animate} />
        <Skeleton variant="text" width="40%" height="12px" animate={animate} />
      </div>
    ))}
  </div>
)

export { Skeleton }