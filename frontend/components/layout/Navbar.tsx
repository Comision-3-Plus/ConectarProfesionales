'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { chatService } from '@/lib/services/chatService';
import { 
  Menu, 
  LogOut, 
  LayoutDashboard, 
  Briefcase, 
  Search, 
  HelpCircle,
  Settings,
  User,
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
  Shield,
  MessageCircle
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  // Suscribirse a conversaciones para contar mensajes no leídos
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const unsubscribe = chatService.subscribeToConversations(user.id, (conversations) => {
        const total = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadCount(total);
      });

      return () => {
        unsubscribe();
      };
    } catch {
      console.warn('Chat no disponible - Firebase no configurado');
      setUnreadCount(0);
    }
  }, [user]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-xl opacity-0 group-hover:opacity-75 transition-all duration-500 blur-md"></div>
              {/* Logo container */}
              <div className="relative flex items-center justify-center h-11 w-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-105">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
              Conectar<span className="text-orange-500 dark:text-orange-400 group-hover:text-orange-600 dark:group-hover:text-orange-500">Pro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2">
            {/* Explorar Button */}
            <Button 
              variant="ghost" 
              asChild 
              className="relative text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-200 group"
            >
              <Link href="/explorar" className="flex items-center">
                <Search className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Explorar</span>
              </Link>
            </Button>

            {/* Theme Toggle Button */}
            <Button 
              variant="ghost" 
              onClick={toggleTheme}
              className="relative text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-200 gap-2"
              disabled={!mounted}
              aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            >
              <div className="relative w-4 h-4">
                <Sun className={`absolute inset-0 h-4 w-4 transition-all duration-500 ${
                  theme === 'light' 
                    ? 'rotate-0 scale-100 opacity-100' 
                    : 'rotate-90 scale-0 opacity-0'
                }`} />
                <Moon className={`absolute inset-0 h-4 w-4 transition-all duration-500 ${
                  theme === 'dark' 
                    ? 'rotate-0 scale-100 opacity-100' 
                    : '-rotate-90 scale-0 opacity-0'
                }`} />
              </div>
              <span className="text-sm">{theme === 'light' ? 'Claro' : 'Oscuro'}</span>
            </Button>

            {/* Ayuda Button */}
            <Button 
              variant="ghost" 
              asChild 
              className="relative text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-200 group"
            >
              <Link href="/ayuda" className="flex items-center">
                <HelpCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Ayuda</span>
              </Link>
            </Button>

            {/* Chat Button (solo si está autenticado) */}
            {isAuthenticated && (
              <Button 
                variant="ghost" 
                asChild 
                className="relative text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-200 group"
              >
                <Link href="/chat" className="flex items-center">
                  <div className="relative">
                    <MessageCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-1 h-5 min-w-[20px] flex items-center justify-center px-1 text-[10px] font-bold pointer-events-none"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium">Mensajes</span>
                </Link>
              </Button>
            )}

            <div className="ml-6 flex items-center space-x-3">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 rounded-full pl-2 pr-3 hover:bg-slate-100 transition-all group"
                    >
                      <Avatar className="mr-2 h-8 w-8 ring-2 ring-orange-500/20 group-hover:ring-orange-500/40 transition-all">
                        <AvatarImage src={user?.avatar_url} alt={user?.nombre} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs font-semibold">
                          {user?.nombre?.[0]}{user?.apellido?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        {user?.nombre}
                      </span>
                      <ChevronDown className="ml-1 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 p-2">
                    <DropdownMenuLabel className="pb-3">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-12 w-12 ring-2 ring-orange-500/30">
                          <AvatarImage src={user?.avatar_url} alt={user?.nombre} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold">
                            {user?.nombre?.[0]}{user?.apellido?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold leading-none text-slate-900">
                            {user?.nombre} {user?.apellido}
                          </p>
                          <p className="text-xs leading-none text-slate-500">{user?.email}</p>
                          <div className="flex gap-2 mt-2">
                            {user?.es_admin && (
                              <Badge variant="destructive" className="text-xs">
                                <Shield className="mr-1 h-3 w-3" />
                                ADMIN
                              </Badge>
                            )}
                            {user?.es_profesional && (
                              <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs">
                                <Sparkles className="mr-1 h-3 w-3" />
                                Verificado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {user?.es_admin && (
                      <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-md">
                        <Link href="/dashboard/admin" className="flex items-center">
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                            <Shield className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Panel de Administración</div>
                            <div className="text-xs text-slate-500">Gestión completa</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {user?.es_cliente && (
                      <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-md">
                        <Link href="/dashboard/cliente" className="flex items-center">
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                            <LayoutDashboard className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Panel de Cliente</div>
                            <div className="text-xs text-slate-500">Gestiona tus proyectos</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.es_profesional && (
                      <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-md">
                        <Link href="/dashboard/profesional" className="flex items-center">
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                            <LayoutDashboard className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Panel Profesional</div>
                            <div className="text-xs text-slate-500">Ver ofertas y trabajos</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator className="my-2" />
                    
                    <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-md">
                      <Link href="/dashboard/perfil" className="flex items-center">
                        <User className="mr-3 h-4 w-4 text-slate-600" />
                        <span className="text-sm">Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {user?.es_profesional && (
                      <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-md">
                        <Link href="/perfil/editar" className="flex items-center">
                          <Settings className="mr-3 h-4 w-4 text-orange-600" />
                          <span className="text-sm">Editar mi Perfil Profesional</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem asChild className="cursor-pointer py-2 rounded-md">
                      <Link href="/dashboard/configuracion" className="flex items-center">
                        <Settings className="mr-3 h-4 w-4 text-slate-600" />
                        <span className="text-sm">Configuración</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="my-2" />
                    
                    <DropdownMenuItem 
                      onClick={() => {
                        // Mostrar toast primero
                        toast.success('👋 Sesión cerrada correctamente', {
                          description: 'Hasta pronto, esperamos verte de nuevo',
                          duration: 4000,
                        });
                        
                        // Luego hacer logout
                        logout();
                        
                        // Delay para permitir que se muestre el toast
                        setTimeout(() => {
                          window.location.href = '/';
                        }, 1500);
                      }} 
                      className="cursor-pointer py-2 rounded-md text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="text-sm font-medium">Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                  <Button 
                    asChild 
                    className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 font-semibold group overflow-hidden"
                  >
                    <Link href="/register" className="flex items-center">
                      {/* Shine effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span>Empezar Gratis</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-10 w-10 hover:bg-slate-100 transition-colors"
                >
                  <Menu className="h-5 w-5 text-slate-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2">
                <DropdownMenuItem asChild className="cursor-pointer py-3 rounded-md">
                  <Link href="/explorar" className="flex items-center">
                    <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
                      <Search className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Explorar Profesionales</div>
                      <div className="text-xs text-slate-500">Encuentra expertos</div>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={toggleTheme}
                  className="cursor-pointer py-3 rounded-md"
                >
                  <div className="flex items-center w-full">
                    <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      {mounted && theme === 'light' ? (
                        <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      ) : (
                        <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {mounted ? (theme === 'light' ? 'Claro' : 'Oscuro') : 'Tema'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {mounted ? (theme === 'light' ? 'Cambiar a oscuro' : 'Cambiar a claro') : 'Toggle'}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer py-3 rounded-md">
                  <Link href="/ayuda" className="flex items-center">
                    <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <HelpCircle className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Centro de Ayuda</div>
                      <div className="text-xs text-slate-500">Soporte 24/7</div>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 ring-2 ring-orange-500/30">
                          <AvatarImage src={user?.avatar_url} alt={user?.nombre} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs font-semibold">
                            {user?.nombre?.[0]}{user?.apellido?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {user?.nombre} {user?.apellido}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenuSeparator className="my-2" />
                    
                    {user?.es_admin && (
                      <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-md">
                        <Link href="/dashboard/admin" className="flex items-center">
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                            <Shield className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Panel de Administración</div>
                            <div className="text-xs text-slate-500">Gestión completa</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {user?.es_cliente && (
                      <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-md">
                        <Link href="/dashboard/cliente" className="flex items-center">
                          <LayoutDashboard className="mr-3 h-4 w-4 text-blue-600" />
                          <span className="text-sm">Panel de Cliente</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.es_profesional && (
                      <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-md">
                        <Link href="/dashboard/profesional" className="flex items-center">
                          <LayoutDashboard className="mr-3 h-4 w-4 text-orange-600" />
                          <span className="text-sm">Panel Profesional</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator className="my-2" />
                    
                    <DropdownMenuItem 
                      onClick={() => {
                        // Mostrar toast primero
                        toast.success('👋 Sesión cerrada correctamente', {
                          description: 'Hasta pronto, esperamos verte de nuevo',
                          duration: 4000,
                        });
                        
                        // Luego hacer logout
                        logout();
                        
                        // Delay para permitir que se muestre el toast
                        setTimeout(() => {
                          window.location.href = '/';
                        }, 1500);
                      }} 
                      className="cursor-pointer py-2.5 rounded-md text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="text-sm font-medium">Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-md">
                      <Link href="/login" className="flex items-center justify-center">
                        <User className="mr-2 h-4 w-4" />
                        <span className="text-sm font-medium">Iniciar Sesión</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer p-0 rounded-md">
                      <Link 
                        href="/register" 
                        className="flex items-center justify-center w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-md hover:from-orange-600 hover:to-orange-700"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span className="text-sm">Empezar Gratis</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
