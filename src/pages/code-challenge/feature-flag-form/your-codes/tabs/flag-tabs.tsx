import type { ReactNode } from 'react'
import { Settings2, Layers3, GitBranch, Tags } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '#/components/ui/tabs'

interface FlagTabsProps {
  value: string
  onValueChange: (value: string) => void
  children: {
    general: ReactNode
    variations: ReactNode
    targeting: ReactNode
    metadata: ReactNode
  }
}

export default function FlagTabs({
  value,
  onValueChange,
  children,
}: FlagTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl p-1 sm:grid-cols-4">
        <TabsTrigger value="general" className="gap-2 rounded-lg py-2.5">
          <Settings2 className="size-4" />
          <span>General</span>
        </TabsTrigger>
        <TabsTrigger value="variations" className="gap-2 rounded-lg py-2.5">
          <Layers3 className="size-4" />
          <span>Variations</span>
        </TabsTrigger>
        <TabsTrigger value="targeting" className="gap-2 rounded-lg py-2.5">
          <GitBranch className="size-4" />
          <span>Targeting</span>
        </TabsTrigger>
        <TabsTrigger value="metadata" className="gap-2 rounded-lg py-2.5">
          <Tags className="size-4" />
          <span>Metadata</span>
        </TabsTrigger>
      </TabsList>
      <div className="mt-6 min-h-[360px]">
        <TabsContent value="general">{children.general}</TabsContent>
        <TabsContent value="variations">{children.variations}</TabsContent>
        <TabsContent value="targeting">{children.targeting}</TabsContent>
        <TabsContent value="metadata">{children.metadata}</TabsContent>
      </div>
    </Tabs>
  )
}
