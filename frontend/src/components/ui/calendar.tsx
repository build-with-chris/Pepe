import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar p-2 [--cell-size:--spacing(7)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: "flex flex-col md:flex-row gap-3 relative",
        month: "flex flex-col w-full gap-3",
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none hover:bg-muted/40",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none hover:bg-muted/40",
          defaultClassNames.button_next
        ),
        month_caption:
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size) text-sm font-medium",
        dropdowns:
          "w-full flex items-center text-sm justify-center h-(--cell-size) gap-1",
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday:
          "text-foreground/80 rounded-md flex-1 font-normal text-xs select-none",
        week: "flex w-full mt-1",
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: "relative w-full h-full p-0 text-center aspect-square select-none rounded-lg overflow-hidden",
        range_start: "rounded-l-md",
        range_middle: "rounded-none",
        range_end: "rounded-r-md",
        today: "rounded-md",
        outside: cn(
          "text-foreground/60 aria-selected:text-foreground/60",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn("rounded-md border border-white bg-transparent", className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      aria-pressed={!!modifiers.selected}
      className={cn(
        "flex aspect-square size-auto w-full min-w-(--cell-size) items-center justify-center text-xs font-black bg-transparent text-white rounded-lg overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-0",
        (modifiers as any).available && "bg-green-500/40 ring-1 ring-green-500/25 text-foreground text-white font-black",
        (modifiers as any).blocked && "bg-red-500/25 ring-1 ring-red-500/20 text-foreground/90 text-white font-black",
        (modifiers.selected && !modifiers.range_middle) && "bg-white text-black hover:bg-white/90 focus:bg-white/90 rounded-lg overflow-hidden",
        (modifiers.range_start || modifiers.range_end) && "bg-white text-black hover:bg-white/90 focus:bg-white/90 rounded-lg overflow-hidden",
        modifiers.range_middle && "bg-accent text-accent-foreground",
        modifiers.today && !modifiers.selected && "ring-1 ring-primary",
        modifiers.outside && "text-foreground/60",
        !modifiers.selected && !modifiers.range_middle && !modifiers.range_start && !modifiers.range_end && "hover:bg-blue-500 hover:text-white",
        modifiers.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
