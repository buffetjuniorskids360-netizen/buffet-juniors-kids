import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, MotionProps } from "framer-motion"

import { cn } from "@/lib/utils"
import { enhancedButtonVariants, respectMotionPreference } from "@/lib/animations"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-xl",
        destructive: "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:from-orange-600 hover:to-red-700 hover:shadow-xl",
        outline: "border border-slate-300 bg-background hover:bg-slate-50 hover:border-slate-400",
        secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700",
        success: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700 hover:shadow-xl",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  animate?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, animate = true, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button
    const isDisabled = disabled || loading
    
    const motionProps = animate ? respectMotionPreference({
      variants: enhancedButtonVariants,
      initial: "rest",
      animate: loading ? "loading" : "rest",
      whileHover: !isDisabled ? "hover" : "rest",
      whileTap: !isDisabled ? "tap" : "rest"
    }) : {}
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...(animate ? motionProps : {})}
        {...props}
      >
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }