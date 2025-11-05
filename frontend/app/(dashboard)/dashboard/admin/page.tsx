'use client';

/**
 * Página de Admin Dashboard - REFACTORIZADA
 * Golden Path: composition pattern, < 50 líneas
 */

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Briefcase, Wrench, Zap, BarChart3, Activity, CheckCircle2 } from 'lucide-react';
import { DashboardMetrics } from '@/components/features/admin';

export default function AdminDashboardPage() {
  const quickAccess = [
    { href: '/dashboard/admin/users', title: 'Gestión de Usuarios', description: 'Ver y moderar usuarios', icon: Users, color: 'blue' },
    { href: '/dashboard/admin/kyc', title: 'Verificación KYC', description: 'Aprobar profesionales', icon: Shield, color: 'yellow' },
    { href: '/dashboard/admin/trabajos', title: 'Trabajos', description: 'Gestionar trabajos', icon: Briefcase, color: 'purple' },
    { href: '/dashboard/admin/oficios', title: 'Oficios', description: 'Gestionar categorías', icon: Wrench, color: 'orange' },
    { href: '/dashboard/admin/servicios', title: 'Servicios Instantáneos', description: 'Servicios rápidos', icon: Zap, color: 'green' },
    { href: '/dashboard/admin/metrics', title: 'Métricas Detalladas', description: 'Análisis completo', icon: BarChart3, color: 'red' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard de Administración</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Gestión completa de la plataforma ConectarPro
        </p>
      </div>

      <DashboardMetrics />

      <div>
        <h2 className="text-xl font-semibold mb-4">🚀 Accesos Rápidos</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickAccess.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <div className={`h-12 w-12 rounded-xl bg-${item.color}-100 flex items-center justify-center`}>
                        <IconComponent className={`h-6 w-6 text-${item.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
