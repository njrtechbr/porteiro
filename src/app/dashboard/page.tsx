import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GateControl } from "@/components/gate-control";
import { getUsers } from "@/lib/data";
import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, isFuture, isPast } from "date-fns";
import { KeyRound, Users, CalendarClock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
                   <Badge variant={user.role === 'Family' ? 'secondary' : 'outline'}>{user.role}</Badge>
                   {user.accessEnd && <p className="text-muted-foreground">ends {format(user.accessEnd, 'MMM d')}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground pt-2">No users with {title.toLowerCase()}.</p>
        )}
      </CardContent>
    </Card>
  )
}

function GuestInviteCard({ invites }: { invites?: number }) {
  if (invites === undefined) return null; // Or show something else for non-guests

  const inviteLink = "https://gatekeeper.app/invite/a1b2c3d4";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Your Guest Invites</CardTitle>
        <CardDescription>Share this link to invite others. They will have access for the duration of your stay.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">You have <span className="text-primary font-bold">{invites}</span> invites remaining.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Input id="invite-link" value={inviteLink} readOnly />
          <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(inviteLink)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


export default function DashboardPage() {
  const users = getUsers();
  const currentUser = users.find(u => u.role === 'Guest'); // Assuming the logged in user is a guest for demo

  const now = new Date();
  const activeUsers = users.filter(u => 
    u.status === 'active' && 
    (u.role === 'Family' || (u.accessStart && u.accessEnd && !isPast(u.accessEnd) && !isFuture(u.accessStart)))
  );
  
  const upcomingUsers = users.filter(u => 
    u.status === 'pending' && u.accessStart && isFuture(u.accessStart)
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <div className="lg:col-span-4 space-y-4">
        <GateControl />
        {currentUser?.role === 'Guest' && <GuestInviteCard invites={currentUser.invites} />}
      </div>
      <div className="lg:col-span-3 space-y-4">
        <UserAccessList title="Active Access" users={activeUsers} icon={KeyRound} />
        <UserAccessList title="Upcoming Access" users={upcomingUsers} icon={CalendarClock} />
      </div>
    </div>
  );
}
