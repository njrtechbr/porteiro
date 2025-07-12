import { Separator } from "@/components/ui/separator"

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações da propriedade, integrações e acesso.
        </p>
      </div>
      <Separator />
      <div className="flex-1 lg:max-w-4xl">{children}</div>
    </div>
  )
}
