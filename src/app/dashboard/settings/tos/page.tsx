import { TosGenerator } from "@/components/tos-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TosPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Terms of Service Generator</CardTitle>
          <CardDescription>
            Use our AI-powered tool to generate a Terms of Service document for your users.
            Enter the required details below and the AI will create a customized document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TosGenerator />
        </CardContent>
      </Card>
    </div>
  );
}
