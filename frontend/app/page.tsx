'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProfessionalCard } from '@/components/features/ProfessionalCard';
import { 
  Search, 
  Briefcase, 
  ArrowRight, 
  Shield, 
  Star, 
  Award,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { SearchResult } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // TODO: Implementar endpoint de destacados en el backend
  // Por ahora, deshabilitamos la query para no romper la página
  const destacados: SearchResult[] = [];
  const isLoading = false;

  const handlePublishProject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[handlePublishProject] Estado:', {
      mounted,
      isAuthenticated,
      user,
      rol: user?.rol
    });
    
    if (!mounted) {
      return;
    }
    
    if (!isAuthenticated || !user) {
      // No está logueado, redirigir a registro
      console.log('[handlePublishProject] Redirigiendo a /register');
      router.push('/register');
      return;
    }

    // Usuario logueado: redirigir según su rol
    if (user.rol === 'PROFESIONAL') {
      console.log('[handlePublishProject] Redirigiendo profesional a /dashboard/profesional/publicar');
      router.push('/dashboard/profesional/publicar');
    } else if (user.rol === 'CLIENTE') {
      console.log('[handlePublishProject] Redirigiendo cliente a /proyectos');
      router.push('/proyectos'); // Ver marketplace
    } else {
      console.log('[handlePublishProject] Rol desconocido, redirigiendo a /dashboard');
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-20 sm:py-32">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-48 h-96 w-96 rounded-full bg-orange-500/20 dark:bg-orange-500/10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-linear-to-r from-orange-300/30 to-orange-500/30 dark:from-orange-500/20 dark:to-orange-700/20 blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl animate-blob animation-delay-2000"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-20 h-3 w-3 bg-orange-500 rounded-full animate-float opacity-60"></div>
          <div className="absolute top-40 right-32 h-2 w-2 bg-blue-500 rounded-full animate-float animation-delay-1000 opacity-60"></div>
          <div className="absolute bottom-32 left-1/3 h-4 w-4 bg-orange-400 rounded-full animate-float animation-delay-3000 opacity-60"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              {/* Logo ConectarPro */}
              <div className="mb-8 flex items-center justify-center lg:justify-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-orange-600 shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold bg-linear-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">
                  ConectarPro
                </span>
              </div>
              
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
                Encuentra al{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-linear-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">
                    Profesional Perfecto
                  </span>
                  <span className="absolute -bottom-2 left-0 h-3 w-full bg-orange-200/50 dark:bg-orange-500/20"></span>
                </span>{' '}
                para tu Proyecto
              </h1>
              
              <p className="mb-10 text-lg text-slate-600 dark:text-slate-300 sm:text-xl">
                Conecta con profesionales talentosos verificados en minutos. Paga solo cuando estés 100% satisfecho con el resultado.
              </p>

              {/* Stats */}
              <div className="mb-10 grid grid-cols-3 gap-4 sm:gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 dark:text-orange-400">10K+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Profesionales</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 dark:text-orange-400">50K+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Proyectos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 dark:text-orange-400">4.9★</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Rating Promedio</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Button
                  onClick={handlePublishProject}
                  size="lg"
                  className="w-full bg-orange-500 text-lg hover:bg-orange-600 shadow-lg shadow-orange-500/30 sm:w-auto"
                >
                  <Briefcase className="mr-2 h-5 w-5" />
                  Publicar un Proyecto
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full border-slate-300 text-lg sm:w-auto"
                >
                  <Link href="/explorar">
                    <Search className="mr-2 h-5 w-5" />
                    Explorar Profesionales
                  </Link>
                </Button>
              </div>

              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                ✓ Sin costos ocultos · ✓ Pagos seguros · ✓ Soporte 24/7
              </p>
            </motion.div>

            {/* Right: Image/Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-2xl bg-linear-to-r from-orange-500/20 to-orange-600/20 dark:from-orange-500/10 dark:to-orange-600/10 blur-2xl"></div>
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-2xl">
                  <div className="space-y-4">
                    {/* Mock UI Elements */}
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-linear-to-br from-orange-400 to-orange-600"></div>
                      <div className="flex-1">
                        <div className="h-3 w-32 rounded bg-slate-200"></div>
                        <div className="mt-2 h-2 w-24 rounded bg-slate-100"></div>
                      </div>
                      <div className="h-8 w-20 rounded-full bg-orange-100"></div>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                      <div className="h-2 w-full rounded bg-slate-100"></div>
                      <div className="mt-2 h-2 w-3/4 rounded bg-slate-100"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-20 flex-1 rounded-lg bg-linear-to-br from-orange-50 to-orange-100"></div>
                      <div className="h-20 flex-1 rounded-lg bg-linear-to-br from-slate-50 to-slate-100"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-slate-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              ¿Por qué elegir ConectarPro?
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              La plataforma más confiable para conectar con profesionales de élite
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="relative overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 dark:bg-slate-800 h-full">
                <div className="absolute inset-0 bg-linear-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all duration-500"></div>
                <CardContent className="relative p-6">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-orange-100 to-orange-200 dark:from-orange-950/30 dark:to-orange-900/30 shadow-lg group-hover:shadow-orange-500/50 group-hover:scale-110 transition-all duration-500">
                    <Shield className="h-7 w-7 text-orange-500 dark:text-orange-400 group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">Pago Seguro</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Tu dinero está protegido con MercadoPago hasta que apruebes el trabajo finalizado.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="relative overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 dark:bg-slate-800 h-full">
                <div className="absolute inset-0 bg-linear-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all duration-500"></div>
                <CardContent className="relative p-6">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-orange-100 to-orange-200 dark:from-orange-950/30 dark:to-orange-900/30 shadow-lg group-hover:shadow-orange-500/50 group-hover:scale-110 transition-all duration-500">
                    <Award className="h-7 w-7 text-orange-500 dark:text-orange-400 group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">Verificados</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Todos los profesionales pasan por un riguroso proceso de verificación y validación.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="relative overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 dark:bg-slate-800 h-full">
                <div className="absolute inset-0 bg-linear-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all duration-500"></div>
                <CardContent className="relative p-6">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-orange-100 to-orange-200 dark:from-orange-950/30 dark:to-orange-900/30 shadow-lg group-hover:shadow-orange-500/50 group-hover:scale-110 transition-all duration-500">
                    <Clock className="h-7 w-7 text-orange-500 dark:text-orange-400 group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">Respuesta Rápida</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Recibe múltiples ofertas en menos de 24 horas y elige la que más te convenga.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="relative overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 dark:bg-slate-800 h-full">
                <div className="absolute inset-0 bg-linear-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all duration-500"></div>
                <CardContent className="relative p-6">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-orange-100 to-orange-200 dark:from-orange-950/30 dark:to-orange-900/30 shadow-lg group-hover:shadow-orange-500/50 group-hover:scale-110 transition-all duration-500">
                    <Star className="h-7 w-7 text-orange-500 dark:text-orange-400 group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">Alta Calidad</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Sistema de reseñas verificadas para garantizar siempre los mejores resultados.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-50 dark:bg-slate-950 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Cómo funciona
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Encuentra y contrata profesionales en 3 simples pasos
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></div>
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-orange-600 text-3xl font-bold text-white shadow-2xl shadow-orange-500/50 group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">Publica tu Proyecto</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Describe tu proyecto en minutos. Es gratis y sin compromiso.
                </p>
              </div>
              {/* Connector Line - Simple and visible */}
              <div className="absolute right-0 top-10 hidden h-0.5 w-full translate-x-1/2 bg-orange-300 dark:bg-orange-800/50 md:block"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse animation-delay-1000"></div>
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-orange-600 text-3xl font-bold text-white shadow-2xl shadow-orange-500/50 group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">Recibe Ofertas</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Profesionales interesados te enviarán sus propuestas con precios y plazos.
                </p>
              </div>
              {/* Connector Line - Simple and visible */}
              <div className="absolute right-0 top-10 hidden h-0.5 w-full translate-x-1/2 bg-orange-300 dark:bg-orange-800/50 md:block"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse animation-delay-2000"></div>
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-orange-600 text-3xl font-bold text-white shadow-2xl shadow-orange-500/50 group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">Elige y Trabaja</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Selecciona al mejor profesional, colabora y paga solo cuando estés satisfecho.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="group relative overflow-hidden bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/60 transition-all hover:scale-105">
              <Link href="/register">
                <span className="relative z-10 flex items-center">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/30 to-transparent"></div>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Destacados Section */}
      <section className="bg-white dark:bg-slate-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                Profesionales Destacados
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Los mejores profesionales con las calificaciones más altas
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/explorar">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : destacados && destacados.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destacados.map((professional: SearchResult) => (
                <ProfessionalCard key={professional.id} professional={professional} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">No hay profesionales destacados en este momento.</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline">
              <Link href="/explorar">
                Ver todos los profesionales
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-linear-to-br from-slate-50 to-orange-50 dark:from-slate-950 dark:to-slate-900 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Miles de proyectos exitosos avalan nuestra plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                name: 'María González',
                role: 'Cliente',
                text: 'Encontré al diseñador perfecto para mi marca. El proceso fue súper fácil y el resultado superó mis expectativas.',
                rating: 5,
              },
              {
                name: 'Carlos Ruiz',
                role: 'Profesional',
                text: 'Como desarrollador freelance, esta plataforma me ayudó a conseguir proyectos de calidad y clientes serios.',
                rating: 5,
              },
              {
                name: 'Ana Martínez',
                role: 'Cliente',
                text: 'El sistema de pagos seguros me dio tranquilidad. Pagué solo cuando el trabajo estuvo completamente terminado.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="relative overflow-hidden h-full dark:bg-slate-800 dark:border-slate-700 border-2 border-slate-200 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-orange-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-8">
                    <div className="mb-6 flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="h-5 w-5 fill-orange-500 text-orange-500 dark:fill-orange-400 dark:text-orange-400 group-hover:scale-125 transition-transform duration-300" 
                          style={{ transitionDelay: `${i * 50}ms` }}
                        />
                      ))}
                    </div>
                    <p className="mb-6 text-slate-600 dark:text-slate-300 italic leading-relaxed text-lg">&quot;{testimonial.text}&quot;</p>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                        <div className="relative h-12 w-12 rounded-full bg-linear-to-br from-orange-400 to-orange-600 shadow-lg group-hover:scale-110 transition-transform"></div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">{testimonial.name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-linear-to-r from-orange-500 via-orange-600 to-orange-500 py-20 sm:py-28">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-1000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
              ¿Listo para empezar tu próximo proyecto?
            </h2>
            <p className="mt-6 text-xl text-orange-50 drop-shadow">
              Únete a miles de clientes y profesionales que confían en ConectarPro
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden bg-white text-orange-600 hover:bg-orange-50 shadow-2xl hover:shadow-white/50 px-8 py-6 text-lg font-bold transition-all hover:scale-105"
              >
                <Link href="/register">
                  <span className="relative z-10 flex items-center">
                    Registrarse Gratis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-orange-100 to-transparent"></div>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="group border-2 border-white bg-transparent text-white hover:bg-white hover:text-orange-600 px-8 py-6 text-lg font-bold transition-all hover:scale-105 shadow-lg hover:shadow-white/50"
              >
                <Link href="/explorar">
                  <Search className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Explorar Profesionales
                </Link>
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-12 flex items-center justify-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-white" />
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span className="text-sm font-medium">Verificado</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
