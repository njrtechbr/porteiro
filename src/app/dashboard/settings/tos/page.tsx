import { TosGenerator } from "@/components/tos-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TosPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Gerador de Termos de Serviço</CardTitle>
          <CardDescription>
            Use nossa ferramenta com IA para gerar um documento de Termos de Serviço para seus usuários.
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
