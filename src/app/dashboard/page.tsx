import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GateControl } from "@/components/gate-control";
import { getUsers } from "@/lib/data";
import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, isFuture, isPast } from "date-fns";
import { KeyRound, CalendarClock } from "lucide-react";
import { GuestInviteCard } from "@/components/guest-invite-card";

function UserAccessList({ title, users, icon: Icon }: { title: string; users: User[]; icon: React.ElementType }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="ml-auto text-right text-sm">
                   <Badge variant={user.role === 'Família' ? 'secondary' : 'outline'}>{user.role}</Badge>
                   {user.accessEnd && <p className="text-muted-foreground">expira em {format(user.accessEnd, 'dd/MMM')}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground pt-2">Nenhum usuário com {title.toLowerCase()}.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const users = getUsers();
  const currentUser = users.find(u => u.role === 'Hóspede'); 

  const now = new Date();
  const activeUsers = users.filter(u => 
    u.status === 'ativo' && 
    (u.role === 'Família' || (u.accessStart && u.accessEnd && !isPast(u.accessEnd) && !isFuture(u.accessStart)))
  );
  
  const upcomingUsers = users.filter(u => 
    u.status === 'pendente' && u.accessStart && isFuture(u.accessStart)
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <div className="lg:col-span-4 space-y-4">
        <GateControl />
        {currentUser?.role === 'Hóspede' && <GuestInviteCard invites={currentUser.invites} />}
      </div>
      <div className="lg:col-span-3 space-y-4">
        <UserAccessList title="Acesso Ativo" users={activeUsers} icon={KeyRound} />
        <UserAccessList title="Acessos Futuros" users={upcomingUsers} icon={CalendarClock} />
      </div>
    </div>
  );
}
