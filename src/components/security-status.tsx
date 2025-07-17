'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldX, Clock, AlertTriangle } from 'lucide-react';
import { User } from '@/lib/types';

interface SecurityStatusProps {
  user: User;
  isValidating?: boolean;
}

export function SecurityStatus({ user, isValidating = false }: SecurityStatusProps) {
  const getStatusInfo = () => {
    const now = new Date();
    
    // Verificar se o cadastro está completo
    if (!user.password) {
      return {
        status: 'incomplete',
        icon: AlertTriangle,
        label: 'Cadastro Incompleto',
        description: 'Complete seu cadastro para ter acesso',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
    }
    
    // Verificar status do usuário
    if (user.status === 'expirado') {
      return {
        status: 'expired',
        icon: ShieldX,
        label: 'Acesso Expirado',
        description: 'Seu acesso foi revogado',
        color: 'bg-red-100 text-red-800 border-red-200'
      };
    }
    
    if (user.status === 'pendente') {
      return {
        status: 'pending',
        icon: Clock,
        label: 'Pendente',
        description: 'Aguardando ativação',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
    }
    
    // Verificar período de acesso
    if (user.accessStart && user.accessEnd) {
      if (now < user.accessStart) {
        return {
          status: 'future',
          icon: Clock,
          label: 'Acesso Futuro',
          description: `Válido a partir de ${user.accessStart.toLocaleDateString('pt-BR')}`,
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      }
      
      if (now > user.accessEnd) {
        return {
          status: 'expired',
          icon: ShieldX,
          label: 'Período Expirado',
          description: `Expirou em ${user.accessEnd.toLocaleDateString('pt-BR')}`,
          color: 'bg-red-100 text-red-800 border-red-200'
        };
      }
      
      // Verificar se está próximo do vencimento (últimas 24 horas)
      const hoursUntilExpiry = (user.accessEnd.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntilExpiry <= 24) {
        return {
          status: 'expiring',
          icon: AlertTriangle,
          label: 'Expirando em Breve',
          description: `Expira em ${user.accessEnd.toLocaleDateString('pt-BR')}`,
          color: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      }
    }
    
    // Verificar se tem portões acessíveis
    if (user.accessibleGates.length === 0) {
      return {
        status: 'no_gates',
        icon: ShieldX,
        label: 'Sem Portões',
        description: 'Você não tem acesso a nenhum portão',
        color: 'bg-gray-100 text-gray-800 border-gray-200'
      };
    }
    
    // Status ativo
    return {
      status: 'active',
      icon: ShieldCheck,
      label: 'Acesso Ativo',
      description: `Acesso a ${user.accessibleGates.length} portão(ões)`,
      color: 'bg-green-100 text-green-800 border-green-200'
    };
  };
  
  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isValidating ? (
              <Shield className="h-5 w-5 animate-pulse text-blue-500" />
            ) : (
              <StatusIcon className="h-5 w-5" />
            )}
            <Badge variant="outline" className={statusInfo.color}>
              {isValidating ? 'Verificando...' : statusInfo.label}
            </Badge>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {isValidating ? 'Validando seu acesso...' : statusInfo.description}
            </p>
          </div>
        </div>
        
        {user.accessStart && user.accessEnd && statusInfo.status === 'active' && (
          <div className="mt-2 text-xs text-muted-foreground">
            Válido até {user.accessEnd.toLocaleDateString('pt-BR')} às {user.accessEnd.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 