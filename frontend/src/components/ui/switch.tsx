"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all duration-200 outline-none",
        "border-transparent",
        "data-[state=unchecked]:bg-white/20",
        "data-[state=checked]:bg-[#D4A574]",
        "focus-visible:ring-2 focus-visible:ring-[#D4A574]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full shadow-lg ring-0 transition-transform",
          "bg-white",
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
