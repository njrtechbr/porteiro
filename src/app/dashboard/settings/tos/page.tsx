import { TosGenerator } from "@/components/tos-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TosPage() {
  return (
    <div className="space-y-6">
       <div>
        <h3 className="text-lg font-medium font-headline">Gerador de Termos de Serviço</h3>
        <p className="text-sm text-muted-foreground">
           Use nossa ferramenta com IA para gerar um documento de Termos de Serviço.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gerador de Termos com IA</CardTitle>
          <CardDescription>
            Insira os detalhes necessários abaixo e a IA criará um documento personalizado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TosGenerator />
        </CardContent>
      </Card>
    </div>
  );
}
