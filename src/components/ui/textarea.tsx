import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-neutral-300 dark:border-slate-700 placeholder:text-muted-foreground focus-visible:border-accent focus-visible:ring-accent/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-slate-800 flex field-sizing-content min-h-24 w-full rounded-lg border bg-white dark:bg-slate-800 px-3 py-2 text-base shadow-sm transition-all duration-200 outline-none focus-visible:ring-[3px] focus-visible:shadow-md disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
