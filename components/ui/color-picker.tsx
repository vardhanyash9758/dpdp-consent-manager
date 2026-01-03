"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Paintbrush } from "lucide-react"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const presetColors = [
    "#4F46E5",
    "#7C3AED",
    "#2563EB",
    "#0891B2",
    "#059669",
    "#DC2626",
    "#EA580C",
    "#CA8A04",
    "#64748B",
    "#1E293B",
  ]

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2 font-normal bg-transparent">
            <div className="h-5 w-5 rounded border" style={{ backgroundColor: value }} />
            <span className="flex-1 text-left font-mono text-sm">{value}</span>
            <Paintbrush className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Color</Label>
              <div className="flex gap-2">
                <div className="h-12 w-12 rounded-md border" style={{ backgroundColor: value }} />
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-12 flex-1 cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Hex Value</Label>
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#4F46E5"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Presets</Label>
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onChange(color)}
                    className="h-8 w-8 rounded-md border transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
