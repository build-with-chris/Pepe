import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl px-4 py-3 text-base transition-all duration-200",
        "bg-white/5 border border-white/10 text-white",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white",
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

export { Input }
