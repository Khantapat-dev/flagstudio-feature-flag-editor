
'use client'

import * as React from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'

import { cn } from '#/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm outline-none',
        'transition-colors duration-200 ease-in-out',

        // Light mode
        'data-[state=checked]:bg-indigo-600',
        'data-[state=unchecked]:bg-slate-300',

        // Dark mode
        'dark:data-[state=checked]:bg-indigo-400',
        'dark:data-[state=unchecked]:bg-zinc-600',

        // Focus
        'focus-visible:ring-[3px] focus-visible:ring-indigo-500/25',
        'dark:focus-visible:ring-indigo-400/30',

        // Disabled
        'disabled:cursor-not-allowed disabled:opacity-50',

        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block size-5 rounded-full bg-white shadow-sm',
          'transition-transform duration-200 ease-in-out',
          'data-[state=checked]:translate-x-5',
          'data-[state=unchecked]:translate-x-0',
          'dark:data-[state=unchecked]:bg-zinc-100',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
