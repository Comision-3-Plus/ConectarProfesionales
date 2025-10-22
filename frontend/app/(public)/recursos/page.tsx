"use client";

import { motion } from "framer-motion";
import { BookOpen, Video, FileText, Headphones, Download, Users, Sparkles, TrendingUp, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RecursosPage() {
  const resourceCategories = [
    {
      icon: BookOpen,
      title: "Guías y Tutoriales",
      description: "Aprende las mejores prácticas para destacar en la plataforma",
      resources: [
        "Cómo crear un perfil ganador",
        "Estrategias de pricing efectivas",
        "Comunicación con clientes",
        "Gestión de proyectos exitosos"
      ],
      color: "from-blue-500 to-blue-600",
      count: "12 guías"
    },
    {
      icon: Video,
      title: "Video Tutoriales",
      description: "Contenido audiovisual paso a paso para dominar la plataforma",
      resources: [
        "Tour completo de la plataforma",
        "Cómo ganar tu primer proyecto",
        "Optimización de portfolio",
        "Trucos de profesionales top"
      ],
      color: "from-purple-500 to-purple-600",
      count: "8 videos"
    },
    {
      icon: FileText,
      title: "Plantillas y Formatos",
      description: "Documentos listos para usar en tus proyectos",
      resources: [
        "Plantillas de presupuestos",
        "Contratos de servicios",
        "Facturas profesionales",
        "Términos y condiciones"
      ],
      color: "from-green-500 to-green-600",
      count: "15 plantillas"
    },
    {
      icon: Headphones,
      title: "Webinars y Eventos",
      description: "Sesiones en vivo con expertos y profesionales exitosos",
      resources: [
        "Marketing para freelancers",
        "Negociación de tarifas",
        "Networking efectivo",
        "Tendencias del mercado"
      ],
      color: "from-orange-500 to-orange-600",
      count: "Próximamente"
    }
  ];

  const popularResources = [
    {
      title: "Guía Completa: De Cero a Tu Primer Cliente",
      description: "Todo lo que necesitas saber para conseguir tu primer proyecto en ConectarPro",
      type: "Guía PDF",
      time: "15 min lectura",
      icon: Download,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Video: Cómo Destacar tu Perfil",
      description: "Aprende las técnicas que usan los profesionales top para atraer más clientes",
      type: "Video",
      time: "12 min",
      icon: Video,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Plantilla de Presupuesto Profesional",
      description: "Documento editable para crear cotizaciones que impresionen a tus clientes",
      type: "Plantilla DOCX",
      time: "Descarga",
      icon: FileText,
      color: "from-green-500 to-green-600"
    }
  ];

  const stats = [
    { icon: Users, value: "5,000+", label: "Profesionales capacitados" },
    { icon: BookOpen, value: "50+", label: "Recursos disponibles" },
    { icon: Award, value: "4.9/5", label: "Calificación promedio" },
    { icon: TrendingUp, value: "40%", label: "Aumento de ingresos" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
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
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-3xl mb-6 shadow-xl"
            >
              <Sparkles className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Centro de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500 dark:from-purple-500 dark:to-orange-400">
                Recursos
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Guías, tutoriales, plantillas y todo lo que necesitas para tener éxito
              como profesional en ConectarPro
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-orange-500 dark:from-purple-600 dark:to-orange-600 rounded-xl mb-4">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500 dark:from-purple-500 dark:to-orange-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Resources */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-500 px-4 py-2 rounded-full mb-6">
              <TrendingUp className="h-5 w-5" />
              <span className="font-semibold">Más Populares</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Recursos Destacados
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Los recursos más descargados y mejor valorados por nuestra comunidad
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {popularResources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
              >
                <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                  <div className={`relative h-48 bg-gradient-to-br ${resource.color} flex items-center justify-center`}>
                    <resource.icon className="h-20 w-20 text-white/50" />
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold">
                        {resource.type}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {resource.time}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-500 transition-colors">
                      {resource.title}
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-400 mb-6 flex-1">
                      {resource.description}
                    </p>

                    <Button className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-600 text-white">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar Gratis
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Categorías de Recursos
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Explora nuestra biblioteca completa de contenido educativo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {resourceCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 dark:opacity-5 rounded-3xl blur-xl group-hover:blur-2xl transition-all`}></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                      <category.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold">
                      {category.count}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                    {category.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {category.description}
                  </p>

                  <ul className="space-y-3 mb-6">
                    {category.resources.map((resource, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        {resource}
                      </li>
                    ))}
                  </ul>

                  <Button variant="outline" className="w-full border-2 border-purple-500 text-purple-600 dark:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30">
                    Explorar {category.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
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
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-orange-500 dark:from-purple-600 dark:to-orange-600 p-12 md:p-16 text-center max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-blob"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                ¿Listo para crecer?
              </h2>
              <p className="text-xl text-purple-50 mb-8 max-w-2xl mx-auto">
                Accede a todos los recursos de forma gratuita al crear tu cuenta
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 bg-white text-purple-600 hover:bg-purple-50 font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                    Crear Cuenta Gratis
                  </Button>
                </Link>
                <Link href="/herramientas">
                  <Button variant="outline" size="lg" className="h-14 px-8 border-2 border-white text-white hover:bg-white/10 font-semibold">
                    Ver Herramientas
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
