import { Separator } from "@/components/ui/separator"
import { SidebarNav } from "@/components/sidebar-nav"

const sidebarNavItems = [
  {
    title: "Termos de Serviço",
    href: "/dashboard/settings/tos",
  },
  {
    title: "Home Assistant",
    href: "/dashboard/settings/home-assistant",
  },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="space-y-6 p-4 pb-16 md:p-6 md:pb-16 block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-4xl">{children}</div>
      </div>
    </div>
  )
}
