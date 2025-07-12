'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";
import { LogOut } from "lucide-react";

interface UserHeaderProps {
    user: User;
    onLogout: () => void;
}

export function UserHeader({ user, onLogout }: UserHeaderProps) {
    return (
        <header className="bg-card border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm text-muted-foreground">Bem-vindo(a),</p>
                    <h1 className="text-lg font-bold text-foreground">{user.name.split(' ')[0]}</h1>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout}>
                <LogOut className="h-5 w-5 text-muted-foreground"/>
                <span className="sr-only">Sair</span>
            </Button>
        </header>
    )
}
