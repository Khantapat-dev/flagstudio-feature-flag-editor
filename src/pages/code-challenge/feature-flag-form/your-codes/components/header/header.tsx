import { Box, RotateCcw, Plus } from 'lucide-react'
import ThemeToggle from '../../ui/theme-toggle'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

export type FlagVersion = 'v1.58.0' | 'v1.57.2' | 'v1.56.1' | 'v1.55.3'

interface FlagHeaderProps {
  version: FlagVersion
  onVersionChange: (version: FlagVersion) => void
  onReset?: () => void
  onAddFlag?: () => void
}

export default function FlagHeader({
  version,
  onVersionChange,
  onReset,
  onAddFlag,
}: FlagHeaderProps) {
  return (
    <header className="sticky top-0 z-50 -mx-3 -mt-3 flex flex-col gap-6 border-b border-border bg-background/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-5 sm:-mt-5 sm:p-5">
      <div className="flex items-center justify-end gap-4">
        <Select
          value={version}
          onValueChange={(value) => onVersionChange(value as FlagVersion)}
        >
          <SelectTrigger className="h-9 w-32 rounded-xl">
            <SelectValue placeholder="Version" />
          </SelectTrigger>
          <SelectContent>
            {(['v1.58.0', 'v1.57.2', 'v1.56.1', 'v1.55.3'] as const).map(
              (item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>

        <ThemeToggle />
      </div>

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
            <Box className="size-9 text-blue-500" strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Create Feature Flag
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Configure your feature flag with targeting rules and variations.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={!onReset}
            className="h-11 gap-2 rounded-xl px-4"
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>

          <Button
            type="button"
            variant='outline'
            onClick={onAddFlag}
            className="h-11 gap-2 rounded-xl px-5 border-dashed border-indigo-500/40 text-indigo-500"
          >
            <Plus className="size-4" />
            Add Flag
          </Button>
        </div>
      </div>
    </header>
  )
}
