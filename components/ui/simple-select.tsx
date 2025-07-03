"use client"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface SimpleSelectProps {
  options: { label: string; value: string | number }[]
  value: string | number | null
  onChange: (value: string | number) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function SimpleSelect({
  options,
  value,
  onChange,
  className,
  placeholder = "Select an option",
  disabled = false,
}: SimpleSelectProps) {
  return (
    <Select
      value={value?.toString() ?? ""}
      onValueChange={(newValue) => {
        // Try to convert back to number if the original was a number
        const option = options.find((opt) => opt.value.toString() === newValue)
        if (option) {
          onChange(option.value)
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value.toString()}
            className="cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
