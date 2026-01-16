import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full rounded-xl px-4 py-3 text-base transition-all duration-200 resize-y",
        "bg-white/5 border border-white/10 text-white",
        "placeholder:text-gray-500",
        "hover:border-white/20 hover:bg-white/[0.07]",
        "focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
