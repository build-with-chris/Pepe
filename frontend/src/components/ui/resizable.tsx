import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"
import type { MouseEvent, KeyboardEvent } from "react"

import { cn } from "@/lib/utils"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  defaultSize,
  minSize,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      defaultSize={defaultSize ?? 50}
      minSize={minSize ?? 5}
      {...props}
    />
  )
}

function ResizableHandle({
  withHandle,
  className,
  withLottie,
  lottieSrc,
  jumpTo,
  onJump,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
  withLottie?: boolean
  lottieSrc?: string
  /** Zielwert in Prozent (0–100), auf den beim Klick gesprungen wird. Default: 45 */
  jumpTo?: number
  /** Callback, um das tatsächliche Re-Layout im Parent auszulösen (z. B. über imperativelySetPanelGroupLayout). */
  onJump?: (targetPercent: number) => void
}) {
  const activate = () => {
    const target = typeof jumpTo === "number" ? Math.max(0, Math.min(100, jumpTo)) : 45
    onJump?.(target)
  }

  const onKeyActivate = (e: KeyboardEvent<HTMLDivElement>) => {
    const key = e.key.toLowerCase()
    if (key === "enter" || key === " ") {
      e.preventDefault()
      activate()
    }
  }

  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      role="button"
      tabIndex={0}
      onClick={activate}
      title="Klicken oder Enter/Leertaste: springt auf voreingestellte Größe"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90 bg-white/40 hover:bg-white/70 transition-colors cursor-pointer select-none",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div
          className="bg-white z-10 flex h-6 w-4 items-center justify-center rounded-sm shadow-md cursor-pointer select-none"
          role="button"
          tabIndex={0}
          onKeyDown={onKeyActivate}
          onClick={activate}
          aria-label="Resize-Handle: klicken oder Enter/Leertaste springt auf voreingestellte Größe"
          title="Klicken oder Enter/Leertaste: springt auf voreingestellte Größe"
        >
          <GripVerticalIcon className="size-3 text-black" />
        </div>
      )}
      {withLottie && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center">
          <DotLottieReact
            src={lottieSrc || "https://lottie.host/da09d1f8-6469-4592-a1af-2bd5570a30b5/pQjA8tzdWc.lottie"}
            loop
            autoplay
            style={{ width: "60px", height: "60px", filter: "invert(1) brightness(2)" }}
          />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

export function AnimatedArrow() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)") // Tailwind 'sm' breakpoint
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile('matches' in e ? e.matches : (e as MediaQueryList).matches)
    // Initial
    onChange(mq)
    // Listen
    mq.addEventListener ? mq.addEventListener('change', onChange as (ev: MediaQueryListEvent) => void) : mq.addListener(onChange as any)
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', onChange as (ev: MediaQueryListEvent) => void) : mq.removeListener(onChange as any)
    }
  }, [])

  return (
    <span className="inline-flex items-center align-middle ml-2 pointer-events-none select-none" aria-hidden>
      <DotLottieReact
        src="https://lottie.host/1985d394-ec30-49ec-8af2-308f5d0dcbbf/9r4qtGep4f.lottie"
        loop
        autoplay
        style={{
          width: "56px",
          height: "56px",
          filter: "invert(1) brightness(15)",
          transform: `rotate(${isMobile ? -180 : -270}deg)`,
        }}
      />
    </span>
  )
}
