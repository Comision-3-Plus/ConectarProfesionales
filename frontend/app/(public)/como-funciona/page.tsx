"use client";

import { motion } from "framer-motion";
import { Search, UserCheck, MessageCircle, Star, Shield, Clock, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ComoFuncionaPage() {
  const steps = [
    {
      icon: Search,
      title: "Busca el profesional ideal",
      description: "Explora nuestra amplia base de profesionales verificados. Filtra por categoría, ubicación, precio y calificaciones.",
      details: [
        "Miles de profesionales verificados",
        "Filtros avanzados de búsqueda",
        "Perfiles detallados con portfolios",
        "Reseñas reales de clientes"
      ]
    },
    {
      icon: UserCheck,
      title: "Revisa perfiles y calificaciones",
      description: "Examina la experiencia, trabajos anteriores y opiniones de otros clientes antes de decidir.",
      details: [
        "Portfolios con trabajos realizados",
        "Calificaciones de 1 a 5 estrellas",
        "Comentarios verificados",
        "Certificaciones y credenciales"
      ]
    },
    {
      icon: MessageCircle,
      title: "Contacta directamente",
      description: "Inicia una conversación, describe tu proyecto y recibe ofertas personalizadas sin intermediarios.",
      details: [
        "Chat en tiempo real",
        "Comparte archivos y fotos",
        "Recibe múltiples presupuestos",
        "Negocia términos y plazos"
      ]
    },
    {
      icon: Star,
      title: "Contrata con confianza",
      description: "Acepta la oferta que mejor se ajuste a tus necesidades y comienza tu proyecto de forma segura.",
      details: [
        "Pago seguro a través de la plataforma",
        "Protección del comprador",
        "Garantía de satisfacción",
        "Soporte 24/7"
      ]
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Todos los pagos están protegidos. Tu dinero está seguro hasta que el trabajo esté completo."
    },
    {
      icon: Clock,
      title: "Ahorra Tiempo",
      description: "Encuentra profesionales en minutos, no en días. Compara y contrata rápidamente."
    },
    {
      icon: CheckCircle,
      title: "Calidad Garantizada",
      description: "Solo profesionales verificados. Si algo sale mal, te ayudamos a resolverlo."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl animate-blob"></div>
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
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-3xl mb-6 shadow-xl"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Cómo funciona{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-500 dark:to-orange-400">
                ConectarPro
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Conectamos clientes con profesionales de confianza en 4 simples pasos.
              Es rápido, seguro y transparente.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/explorar">
                <Button size="lg" className="group h-14 px-8 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/registro-profesional">
                <Button variant="outline" size="lg" className="h-14 px-8 border-2 border-orange-500 text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/50 font-semibold">
                  Únete como Profesional
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-12">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Number & Icon */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-orange-500/20 dark:bg-orange-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                        <div className="relative flex flex-col items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-3xl shadow-xl group-hover:scale-110 transition-transform">
                          <div className="absolute -top-3 -right-3 flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg font-bold text-orange-600 dark:text-orange-500">
                            {index + 1}
                          </div>
                          <step.icon className="h-10 w-10 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                        {step.description}
                      </p>
                      <ul className="grid sm:grid-cols-2 gap-3">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block ml-12 mt-6 mb-6">
                      <div className="w-0.5 h-12 bg-gradient-to-b from-orange-300 via-orange-400 to-orange-300 dark:from-orange-800 dark:via-orange-700 dark:to-orange-800"></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              ¿Por qué elegir ConectarPro?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Miles de clientes confían en nosotros cada día
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/5 dark:to-orange-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-blob"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                ¿Listo para empezar?
              </h2>
              <p className="text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
                Únete a miles de clientes satisfechos y encuentra el profesional perfecto hoy
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/explorar">
                  <Button size="lg" className="h-14 px-8 bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                    Buscar Profesionales
                    <Search className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/registro-profesional">
                  <Button variant="outline" size="lg" className="h-14 px-8 border-2 border-white text-white hover:bg-white/10 font-semibold">
                    Ofrecer Servicios
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
