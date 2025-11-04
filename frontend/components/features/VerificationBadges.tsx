/**
 * VerificationBadges - Muestra insignias de verificación del profesional
 * Similar a Airbnb/Uber - muestra confianza y credibilidad
 */
'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Shield, Mail, Calendar, Award } from 'lucide-react';
import { VerificationStatus, ProfessionalLevel } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface VerificationBadgesProps {
  kycStatus: VerificationStatus;
  emailVerified?: boolean;
  memberSince: string;
  trabajosCompletados?: number;
  nivel?: ProfessionalLevel;
}

export function VerificationBadges({
  kycStatus,
  emailVerified = true,
  memberSince,
  trabajosCompletados = 0,
  nivel,
}: VerificationBadgesProps) {
  const badges = [];

  // KYC Verificado
  if (kycStatus === VerificationStatus.APROBADO) {
    badges.push({
      icon: <Shield className="h-4 w-4" />,
      label: 'Identidad verificada',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 hover:bg-green-200',
    });
  }

  // Email verificado
  if (emailVerified) {
    badges.push({
      icon: <Mail className="h-4 w-4" />,
      label: 'Email verificado',
      variant: 'secondary' as const,
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    });
  }

  // Trabajos completados
  if (trabajosCompletados > 0) {
    let label = `${trabajosCompletados} ${trabajosCompletados === 1 ? 'trabajo' : 'trabajos'}`;
    let className = 'bg-purple-100 text-purple-800 hover:bg-purple-200';

    if (trabajosCompletados >= 50) {
      label = `Profesional Elite (${trabajosCompletados}+ trabajos)`;
      className = 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    } else if (trabajosCompletados >= 10) {
      label = `Profesional Establecido (${trabajosCompletados}+ trabajos)`;
      className = 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    }

    badges.push({
      icon: <CheckCircle2 className="h-4 w-4" />,
      label,
      variant: 'secondary' as const,
      className,
    });
  }

  // Nivel profesional
  if (nivel) {
    const nivelConfig = {
      BRONCE: {
        label: 'Nivel Bronce',
        className: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
      },
      PLATA: {
        label: 'Nivel Plata',
        className: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
      },
      ORO: {
        label: 'Nivel Oro',
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      },
      DIAMANTE: {
        label: 'Nivel Diamante',
        className: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
      },
    };

    const config = nivelConfig[nivel];
    if (config) {
      badges.push({
        icon: <Award className="h-4 w-4" />,
        label: config.label,
        variant: 'secondary' as const,
        className: config.className,
      });
    }
  }

  // Miembro desde
  const memberDate = new Date(memberSince);
  const formattedDate = format(memberDate, 'MMMM yyyy', { locale: es });

  badges.push({
    icon: <Calendar className="h-4 w-4" />,
    label: `Miembro desde ${formattedDate}`,
    variant: 'outline' as const,
    className: '',
  });

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <Badge
          key={index}
          variant={badge.variant}
          className={`flex items-center gap-1 ${badge.className}`}
        >
          {badge.icon}
          <span className="text-xs">{badge.label}</span>
        </Badge>
      ))}
    </div>
  );
}
