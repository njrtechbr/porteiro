'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GateControl } from "@/components/gate-control";
import { getAllUsers } from "@/lib/actions";
import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, isFuture, isPast } from "date-fns";
import { KeyRound, CalendarClock } from "lucide-react";
import { GuestInviteCard } from "@/components/guest-invite-card";
import { Skeleton } from '@/components/ui/skeleton';

function UserAccessList({ title, users, icon: Icon, loading }: { title: string; users: User[]; icon: React.ElementType, loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4 pt-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
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
          <p className="text-sm text-muted-foreground pt-2">Nenhum usuário nesta categoria.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const currentUser = users.find(u => u.role === 'Hóspede'); 

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
        <GuestInviteCard invites={currentUser?.invites} />
      </div>
      <div className="lg:col-span-3 space-y-4">
        <UserAccessList title="Acesso Ativo" users={activeUsers} icon={KeyRound} loading={loading} />
        <UserAccessList title="Acessos Futuros" users={upcomingUsers} icon={CalendarClock} loading={loading} />
      </div>
    </div>
  );
}
