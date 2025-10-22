"use client";

import { motion } from "framer-motion";
import { Shield, Lock, RefreshCw, Award, CheckCircle, AlertTriangle, DollarSign, Clock, Users, FileCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GarantiasPage() {
  const guarantees = [
    {
      icon: Shield,
      title: "Protección del Comprador",
      description: "Tu pago está protegido hasta que confirmes que el trabajo está completo y satisfactorio.",
      features: [
        "Dinero retenido en depósito seguro",
        "Liberación solo cuando apruebes el trabajo",
        "Reembolso completo si no estás satisfecho",
        "Sin costos ocultos"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Lock,
      title: "Pagos Seguros",
      description: "Todos los pagos son procesados a través de MercadoPago con encriptación de nivel bancario.",
      features: [
        "Procesamiento seguro con MercadoPago",
        "Múltiples métodos de pago",
        "Encriptación SSL de 256 bits",
        "Certificación PCI DSS"
      ],
      color: "from-green-500 to-green-600"
    },
    {
      icon: RefreshCw,
      title: "Garantía de Satisfacción",
      description: "Si algo no sale como esperabas, trabajamos contigo para encontrar una solución justa.",
      features: [
        "Mediación en caso de disputas",
        "Revisiones ilimitadas según acuerdo",
        "Reembolso si no hay solución",
        "Soporte dedicado 24/7"
      ],
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Award,
      title: "Profesionales Verificados",
      description: "Todos los profesionales pasan por un proceso de verificación antes de poder ofrecer servicios.",
      features: [
        "Verificación de identidad obligatoria",
        "Validación de habilidades y experiencia",
        "Revisión de antecedentes",
        "Sistema de calificaciones transparente"
      ],
      color: "from-purple-500 to-purple-600"
    }
  ];

  const protectionSteps = [
    {
      icon: DollarSign,
      title: "1. Pago Seguro",
      description: "Tu pago se deposita de forma segura en nuestra plataforma"
    },
    {
      icon: Clock,
      title: "2. Trabajo en Progreso",
      description: "El profesional completa el trabajo según lo acordado"
    },
    {
      icon: CheckCircle,
      title: "3. Aprobación",
      description: "Revisas el trabajo y confirmas tu satisfacción"
    },
    {
      icon: Users,
      title: "4. Liberación de Pago",
      description: "El pago se libera al profesional solo cuando apruebes"
    }
  ];

  const policies = [
    {
      icon: FileCheck,
      title: "Política de Reembolso",
      items: [
        "Reembolso completo si el profesional no entrega",
        "Reembolso parcial según mediación en caso de disputa",
        "Proceso de reembolso en 5-7 días hábiles",
        "Sin penalizaciones para el cliente"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Política de Disputas",
      items: [
        "Mediación gratuita por nuestro equipo",
        "Resolución en máximo 15 días hábiles",
        "Evidencia documentada (chat, fotos, archivos)",
        "Decisión justa basada en términos de servicio"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
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
              <Shield className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Tus{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500 dark:from-blue-500 dark:to-orange-400">
                garantías
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Tu tranquilidad es nuestra prioridad. Por eso ofrecemos múltiples capas de protección
              para cada transacción en ConectarPro.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Guarantees */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {guarantees.map((guarantee, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${guarantee.color} opacity-10 dark:opacity-5 rounded-3xl blur-xl group-hover:blur-2xl transition-all`}></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${guarantee.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                    <guarantee.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                    {guarantee.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {guarantee.description}
                  </p>

                  <ul className="space-y-3">
                    {guarantee.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Protection Process */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Cómo te protegemos
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Nuestro sistema de pagos seguros protege cada transacción
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {protectionSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center"
              >
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-orange-500 dark:from-blue-600 dark:to-orange-600 rounded-2xl mb-6 shadow-xl">
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>

                {/* Connector Arrow */}
                {index < protectionSteps.length - 1 && (
                  <div className="hidden md:block absolute top-10 -right-4 w-8 text-orange-400">
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {policies.map((policy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-2xl mb-6">
                  <policy.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                  {policy.title}
                </h3>

                <ul className="space-y-4">
                  {policy.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-500 to-orange-500 dark:from-blue-600 dark:to-orange-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              ¿Tienes alguna pregunta?
            </h2>
            <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
              Nuestro equipo de soporte está disponible 24/7 para ayudarte
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/ayuda">
                <Button size="lg" className="h-14 px-8 bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  Centro de Ayuda
                </Button>
              </Link>
              <Link href="/explorar">
                <Button variant="outline" size="lg" className="h-14 px-8 border-2 border-white text-white hover:bg-white/10 font-semibold">
                  Comenzar Ahora
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
