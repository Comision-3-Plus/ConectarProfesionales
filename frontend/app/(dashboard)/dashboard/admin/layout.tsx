'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Shield,
  Briefcase,
  Settings,
  BarChart3,
  Wrench,
  Zap,
  FileText,
} from 'lucide-react';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
    description: 'Visión general y métricas',
  },
  {
    title: 'Usuarios',
    href: '/dashboard/admin/users',
    icon: Users,
    description: 'Gestión de usuarios',
  },
  {
    title: 'KYC / Verificación',
    href: '/dashboard/admin/kyc',
    icon: Shield,
    description: 'Aprobar profesionales',
  },
  {
    title: 'Trabajos',
    href: '/dashboard/admin/trabajos',
    icon: Briefcase,
    description: 'Ver y gestionar trabajos',
  },
  {
    title: 'Oficios',
    href: '/dashboard/admin/oficios',
    icon: Wrench,
    description: 'Gestionar oficios',
  },
  {
    title: 'Servicios Instantáneos',
    href: '/dashboard/admin/servicios',
    icon: Zap,
    description: 'Servicios rápidos',
  },
  {
    title: 'Métricas',
    href: '/dashboard/admin/metrics',
    icon: BarChart3,
    description: 'Análisis detallado',
  },
  {
    title: 'Configuración',
    href: '/dashboard/admin/settings',
    icon: Settings,
    description: 'Ajustes del sistema',
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col flex-1 min-h-0 pt-5 pb-4 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center flex-shrink-0 px-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Panel Admin
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gestión completa
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110',
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )}
                  />
                  <div className="flex-1">
                    <div className={cn('font-semibold', isActive && 'text-white')}>
                      {item.title}
                    </div>
                    <div
                      className={cn(
                        'text-xs mt-0.5',
                        isActive
                          ? 'text-red-100'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      )}
                    >
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer info */}
          <div className="px-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Documentación
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Accede a la guía completa del panel de administración
                  </p>
                  <Link
                    href="/docs/admin"
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium mt-2 inline-block"
                  >
                    Ver guía →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Admin
              </h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
