import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { inputVariants, respectMotionPreference } from "@/lib/animations"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  animate?: boolean
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, animate = true, error = false, success = false, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }
    
    const getAnimationState = () => {
      if (error) return "error"
      if (success) return "success"
      if (isFocused) return "focus"
      return "initial"
    }
    
    const motionProps = animate ? respectMotionPreference({
      variants: inputVariants,
      animate: getAnimationState()
    }) : {}
    
    const Component = animate ? motion.input : "input"
    
    return (
      <Component
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          !animate && "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          error && "border-red-500 focus:border-red-500",
          success && "border-green-500 focus:border-green-500",
          className
        )}
        ref={ref}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...(animate ? motionProps : {})}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }