import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-accent to-blue-700 text-accent-foreground hover:from-blue-600 hover:to-blue-800 border-accent/30",
        destructive:
          "bg-gradient-to-b from-red-600 to-red-700 text-destructive-foreground hover:from-red-700 hover:to-red-800 border-red-600/30",
        outline:
          "border border-neutral-300 bg-background hover:bg-accent/5 hover:border-accent/50",
        secondary:
          "bg-neutral-100 text-black hover:bg-neutral-200",
        ghost: "border-transparent shadow-none hover:bg-accent/10",
        muted: "bg-neutral-200 text-neutral-600 hover:bg-neutral-200/80",
        teritary: "bg-accent/10 text-accent border-transparent hover:bg-accent/20 shadow-none"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3",
        xs: "h-7 rounded-md px-2 text-xs",
        lg: "h-12 rounded-lg px-8",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
