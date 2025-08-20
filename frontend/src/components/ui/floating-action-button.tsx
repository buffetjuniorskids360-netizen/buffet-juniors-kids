import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { fabVariants, respectMotionPreference } from "@/lib/animations"

export interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isOpen?: boolean
  actions?: Array<{
    id: string
    label: string
    icon: React.ReactNode
    onClick: () => void
    color?: string
  }>
}

const variantClasses = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg",
  secondary: "bg-gray-600 hover:bg-gray-700 text-white shadow-lg",
  success: "bg-green-600 hover:bg-green-700 text-white shadow-lg",
  warning: "bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg"
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-14 h-14",
  lg: "w-16 h-16"
}

export const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ 
    className, 
    icon = <Plus className="w-6 h-6" />, 
    variant = 'primary', 
    size = 'md',
    isOpen = false,
    actions = [],
    onClick,
    ...props 
  }, ref) => {
    const [open, setOpen] = React.useState(isOpen)
    
    React.useEffect(() => {
      setOpen(isOpen)
    }, [isOpen])
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (actions.length > 0) {
        setOpen(!open)
      }
      onClick?.(e)
    }
    
    const motionProps = respectMotionPreference({
      variants: fabVariants,
      initial: "initial",
      animate: "animate",
      whileHover: "hover",
      whileTap: "tap"
    })
    
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {/* Action Menu */}
          {open && actions.length > 0 && (
            <motion.div
              className="absolute bottom-20 right-0 flex flex-col gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-full shadow-lg backdrop-blur-sm",
                    "bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900",
                    "transition-colors duration-200"
                  )}
                  onClick={action.onClick}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ 
                    duration: 0.2, 
                    delay: index * 0.05,
                    ease: "easeOut" 
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex-shrink-0">{action.icon}</span>
                  <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main FAB */}
        <motion.button
          ref={ref}
          className={cn(
            "rounded-full flex items-center justify-center",
            "focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500/50",
            "transition-all duration-200",
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
          onClick={handleClick}
          {...motionProps}
          {...props}
        >
          <motion.div
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {open && actions.length > 0 ? <X className="w-6 h-6" /> : icon}
          </motion.div>
        </motion.button>
      </div>
    )
  }
)
FloatingActionButton.displayName = "FloatingActionButton"

// Hook for managing FAB state
export const useFloatingActionButton = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const toggle = React.useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])
  
  const open = React.useCallback(() => {
    setIsOpen(true)
  }, [])
  
  const close = React.useCallback(() => {
    setIsOpen(false)
  }, [])
  
  return {
    isOpen,
    toggle,
    open,
    close
  }
}

export { FloatingActionButton as default }