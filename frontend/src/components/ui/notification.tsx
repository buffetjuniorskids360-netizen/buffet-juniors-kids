import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"
import { notificationVariants, respectMotionPreference } from "@/lib/animations"

export interface NotificationProps {
  id: string
  title?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: (id: string) => void
  actionLabel?: string
  onAction?: () => void
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const colorMap = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  info: "border-blue-200 bg-blue-50 text-blue-800"
}

const iconColorMap = {
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-yellow-600",
  info: "text-blue-600"
}

export const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ id, title, message, type = 'info', duration = 5000, onClose, actionLabel, onAction, ...props }, ref) => {
    const Icon = iconMap[type]
    
    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          onClose?.(id)
        }, duration)
        
        return () => clearTimeout(timer)
      }
    }, [id, duration, onClose])
    
    const motionProps = respectMotionPreference({
      variants: notificationVariants,
      initial: "initial",
      animate: "animate",
      exit: "exit",
      layout: true
    })
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative max-w-sm w-full border rounded-lg shadow-lg p-4",
          colorMap[type]
        )}
        {...motionProps}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", iconColorMap[type])} />
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-semibold mb-1">{title}</h4>
            )}
            <p className="text-sm leading-relaxed">{message}</p>
            
            {actionLabel && onAction && (
              <motion.button
                className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none"
                onClick={onAction}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {actionLabel}
              </motion.button>
            )}
          </div>
          
          {onClose && (
            <motion.button
              className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
              onClick={() => onClose(id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
        
        {/* Progress bar for auto-dismiss */}
        {duration > 0 && (
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
          />
        )}
      </motion.div>
    )
  }
)
Notification.displayName = "Notification"

// Container for notifications
export interface NotificationContainerProps {
  notifications: NotificationProps[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  onClose?: (id: string) => void
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  position = 'top-right',
  onClose
}) => {
  return (
    <div className={cn("fixed z-[100] flex flex-col gap-3 pointer-events-none", positionClasses[position])}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification
              {...notification}
              onClose={onClose}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<NotificationProps[]>([])
  
  const addNotification = React.useCallback((notification: Omit<NotificationProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { ...notification, id }])
  }, [])
  
  const removeNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])
  
  const clearNotifications = React.useCallback(() => {
    setNotifications([])
  }, [])
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  }
}

export { Notification as default }