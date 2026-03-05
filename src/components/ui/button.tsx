import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border shadow-sm",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-foreground border-accent/60 hover:bg-accent/90",
        destructive:
          "bg-destructive text-destructive-foreground border-destructive/60 hover:bg-destructive/90",
        outline:
          "border-input bg-background hover:bg-accent/5 hover:border-accent/40",
        secondary:
          "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80",
        ghost: "border-transparent shadow-none hover:bg-accent/10",
        muted: "bg-muted text-muted-foreground border-transparent hover:bg-muted/80",
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
