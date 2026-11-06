import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar'
import { AppSidebar } from './code-challenge/feature-flag-form/your-codes/components/sidebar/sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 bg-background">
        <div className="min-w-0 flex-1 p-3 sm:p-5">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
