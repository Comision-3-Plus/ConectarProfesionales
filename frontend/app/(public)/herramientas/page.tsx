"use client";

import { motion } from "framer-motion";
import { Wrench, Calendar, FileText, MessageSquare, BarChart3, DollarSign, Clock, Zap, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HerramientasPage() {
  const tools = [
    {
      icon: Calendar,
      title: "Gestión de Agenda",
      description: "Administra tus citas y disponibilidad de forma inteligente",
      features: [
        "Calendario sincronizado",
        "Recordatorios automáticos",
        "Disponibilidad en tiempo real",
        "Integración con Google Calendar"
      ],
      color: "from-blue-500 to-blue-600",
      badge: "Gratis"
    },
    {
      icon: FileText,
      title: "Cotizaciones Profesionales",
      description: "Crea presupuestos detallados con plantillas personalizables",
      features: [
        "Plantillas prediseñadas",
        "Cálculo automático de IVA",
        "Exportar a PDF",
        "Seguimiento de estado"
      ],
      color: "from-green-500 to-green-600",
      badge: "Gratis"
    },
    {
      icon: MessageSquare,
      title: "Chat Profesional",
      description: "Comunícate con clientes de forma segura y organizada",
      features: [
        "Mensajes en tiempo real",
        "Compartir archivos y fotos",
        "Notificaciones push",
        "Historial completo"
      ],
      color: "from-purple-500 to-purple-600",
      badge: "Gratis"
    },
    {
      icon: BarChart3,
      title: "Analíticas y Reportes",
      description: "Visualiza el rendimiento de tu negocio con datos en tiempo real",
      features: [
        "Estadísticas de proyectos",
        "Ingresos mensuales",
        "Tasa de conversión",
        "Clientes recurrentes"
      ],
      color: "from-orange-500 to-orange-600",
      badge: "Pro"
    },
    {
      icon: DollarSign,
      title: "Gestión de Pagos",
      description: "Controla tus ingresos y pagos de forma centralizada",
      features: [
        "Historial de transacciones",
        "Facturación automática",
        "Reportes fiscales",
        "Múltiples métodos de cobro"
      ],
      color: "from-emerald-500 to-emerald-600",
      badge: "Gratis"
    },
    {
      icon: Clock,
      title: "Control de Tiempo",
      description: "Registra las horas trabajadas en cada proyecto",
      features: [
        "Timer integrado",
        "Reportes por proyecto",
        "Exportar timesheet",
        "Facturación por horas"
      ],
      color: "from-indigo-500 to-indigo-600",
      badge: "Pro"
    }
  ];

  const benefits = [
    "Ahorra hasta 10 horas semanales en administración",
    "Aumenta tu productividad en un 40%",
    "Gestiona hasta 50 proyectos simultáneos",
    "Soporte técnico 24/7"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-300/30 dark:bg-orange-600/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-3xl mb-6 shadow-xl"
            >
              <Wrench className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Herramientas para{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500 dark:from-blue-500 dark:to-orange-400">
                profesionales
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Todo lo que necesitas para gestionar tu negocio freelance de forma profesional
              y eficiente, desde un solo lugar.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-10 dark:opacity-5 rounded-3xl blur-xl group-hover:blur-2xl transition-all`}></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tool.badge === "Pro" 
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" 
                        : "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                    }`}>
                      {tool.badge}
                    </span>
                  </div>

                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${tool.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                    {tool.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {tool.description}
                  </p>

                  <ul className="space-y-3 flex-1">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Beneficios para tu negocio
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Herramientas diseñadas para hacer crecer tu negocio freelance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shrink-0">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-orange-500 dark:from-blue-600 dark:to-orange-600 p-12 md:p-16 text-center max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-blob"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                ¿Listo para ser más productivo?
              </h2>
              <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
                Únete ahora y accede a todas las herramientas básicas gratis
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                    Crear Cuenta Gratis
                  </Button>
                </Link>
                <Link href="/recursos">
                  <Button variant="outline" size="lg" className="h-14 px-8 border-2 border-white text-white hover:bg-white/10 font-semibold">
                    Ver Recursos
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
