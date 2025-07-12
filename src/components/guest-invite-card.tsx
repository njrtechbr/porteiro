'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

export function GuestInviteCard({ invites }: { invites?: number }) {
  if (invites === undefined) return null;

  const inviteLink = "https://porteiro.app/convite/a1b2c3d4";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copiado!",
      description: "O link de convite foi copiado para a área de transferência.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Seus Convites para Hóspedes</CardTitle>
        <CardDescription>Compartilhe este link para convidar outras pessoas. Elas terão acesso durante a sua estadia.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Você tem <span className="text-primary font-bold">{invites}</span> convites restantes.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Input id="invite-link" value={inviteLink} readOnly />
          <Button variant="outline" size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
