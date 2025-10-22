"use client";

import { motion } from "framer-motion";
import { Target, Users, Zap, Heart, Award, TrendingUp, Globe, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SobreNosotrosPage() {
  const values = [
    {
      icon: Heart,
      title: "Pasión por Conectar",
      description: "Creemos que cada persona tiene un talento único que merece ser compartido con el mundo."
    },
    {
      icon: Award,
      title: "Calidad Primero",
      description: "Solo trabajamos con profesionales verificados que cumplen nuestros estándares de excelencia."
    },
    {
      icon: Users,
      title: "Comunidad",
      description: "Construimos una red de confianza donde clientes y profesionales crecen juntos."
    },
    {
      icon: Zap,
      title: "Innovación Constante",
      description: "Mejoramos continuamente nuestra plataforma para ofrecer la mejor experiencia."
    }
  ];

  const stats = [
    { value: "5,000+", label: "Profesionales Activos" },
    { value: "15,000+", label: "Proyectos Completados" },
    { value: "98%", label: "Satisfacción del Cliente" },
    { value: "24/7", label: "Soporte Disponible" }
  ];

  const team = [
    {
      name: "María González",
      role: "CEO & Fundadora",
      description: "Ex-líder de producto en startups tecnológicas, apasionada por democratizar el acceso al talento."
    },
    {
      name: "Carlos Rodríguez",
      role: "CTO",
      description: "15 años de experiencia en desarrollo de plataformas de alto tráfico y sistemas escalables."
    },
    {
      name: "Ana Martínez",
      role: "Head of Community",
      description: "Experta en construcción de comunidades digitales y engagement de usuarios."
    },
    {
      name: "Luis Fernández",
      role: "Head of Operations",
      description: "Especialista en optimización de procesos y garantía de calidad de servicio."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-300/30 dark:bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
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
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-blue-500 dark:from-orange-600 dark:to-blue-600 rounded-3xl mb-6 shadow-xl"
            >
              <Sparkles className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Conectamos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-blue-500 dark:from-orange-500 dark:to-blue-400">
                talento con oportunidades
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              ConectarPro nació de una visión simple: hacer que encontrar el profesional perfecto
              sea tan fácil como unos pocos clics, y que ofrecer tus servicios sea igual de simple.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-500 px-4 py-2 rounded-full mb-6">
                <Target className="h-5 w-5" />
                <span className="font-semibold">Nuestra Misión</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
                Democratizar el acceso al talento profesional
              </h2>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                Creemos que todos merecen acceso a profesionales de calidad, sin importar dónde se encuentren
                o cuál sea su presupuesto. Y que cada profesional talentoso merece una plataforma para brillar.
              </p>

              <p className="text-lg text-slate-600 dark:text-slate-400">
                Por eso construimos ConectarPro: una plataforma transparente, segura y accesible que beneficia
                tanto a clientes como a profesionales por igual.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20 dark:from-orange-500/10 dark:to-blue-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-blue-500 dark:from-orange-500 dark:to-blue-400 mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Nuestros Valores
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Los principios que guían cada decisión que tomamos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-blue-500/10 dark:from-orange-500/5 dark:to-blue-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 h-full">
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-blue-500 dark:from-orange-600 dark:to-blue-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    <value.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Nuestro Equipo
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Las personas apasionadas que hacen que ConectarPro sea posible
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 text-center h-full">
                  {/* Avatar Placeholder */}
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-blue-500 dark:from-orange-600 dark:to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                      {member.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-800"></div>
                  </div>

                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-orange-600 dark:text-orange-500 font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {member.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Nuestra Historia
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {[
              { year: "2023", title: "El Comienzo", description: "ConectarPro nace de la frustración de encontrar profesionales confiables en Argentina." },
              { year: "2024", title: "Crecimiento Acelerado", description: "Superamos los 1,000 profesionales activos y 5,000 proyectos completados." },
              { year: "2025", title: "Expansión", description: "Lanzamos nuevas categorías y funcionalidades basadas en feedback de usuarios." }
            ].map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex gap-8 mb-12 last:mb-0"
              >
                <div className="flex-shrink-0 w-32 text-right">
                  <div className="inline-block bg-gradient-to-br from-orange-500 to-blue-500 dark:from-orange-600 dark:to-blue-600 text-white font-bold text-xl px-6 py-2 rounded-full shadow-lg">
                    {milestone.year}
                  </div>
                </div>
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
                    {milestone.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-blue-500 dark:from-orange-600 dark:to-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Únete a nuestra comunidad
            </h2>
            <p className="text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
              Ya sea que busques servicios o quieras ofrecer tu talento, ConectarPro es tu plataforma
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/explorar">
                <Button size="lg" className="h-14 px-8 bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  Explorar Profesionales
                </Button>
              </Link>
              <Link href="/registro-profesional">
                <Button variant="outline" size="lg" className="h-14 px-8 border-2 border-white text-white hover:bg-white/10 font-semibold">
                  Ofrecer Servicios
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
