"use client";

import { motion } from "framer-motion";
import { HelpCircle, MessageCircle, Mail, Phone, FileQuestion, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AyudaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const categories = [
    {
      title: "Primeros Pasos",
      icon: HelpCircle,
      questions: [
        {
          q: "¿Cómo creo una cuenta en ConectarPro?",
          a: "Haz clic en 'Registrarse' en la parte superior derecha. Elige si deseas registrarte como cliente o profesional, completa el formulario con tu información y verifica tu email."
        },
        {
          q: "¿Es gratis usar ConectarPro?",
          a: "Crear una cuenta y buscar profesionales es completamente gratis. Solo cobramos una pequeña comisión cuando se completa un proyecto exitosamente."
        },
        {
          q: "¿Cómo encuentro el profesional adecuado?",
          a: "Usa nuestros filtros de búsqueda por categoría, ubicación, precio y calificaciones. Lee las reseñas de otros clientes y revisa los portfolios antes de contactar."
        }
      ]
    },
    {
      title: "Pagos y Transacciones",
      icon: MessageCircle,
      questions: [
        {
          q: "¿Cómo funcionan los pagos?",
          a: "Todos los pagos se procesan de forma segura a través de MercadoPago. El dinero se mantiene en depósito hasta que confirmes que el trabajo está completo."
        },
        {
          q: "¿Qué métodos de pago aceptan?",
          a: "Aceptamos tarjetas de crédito, débito, transferencias bancarias y otros métodos disponibles en MercadoPago."
        },
        {
          q: "¿Puedo obtener un reembolso?",
          a: "Sí. Si el profesional no cumple con lo acordado, puedes solicitar un reembolso completo o parcial a través de nuestro sistema de mediación."
        }
      ]
    },
    {
      title: "Para Profesionales",
      icon: FileQuestion,
      questions: [
        {
          q: "¿Cómo creo mi perfil profesional?",
          a: "Después de registrarte, completa tu perfil con tu experiencia, habilidades, portfolio y tarifas. Cuanto más completo, más oportunidades recibirás."
        },
        {
          q: "¿Cuánto cobran de comisión?",
          a: "Cobramos una comisión del 10% sobre cada proyecto completado. No hay costos ocultos ni tarifas de suscripción."
        },
        {
          q: "¿Cómo recibo mis pagos?",
          a: "Los pagos se transfieren a tu cuenta de MercadoPago una vez que el cliente apruebe el trabajo. Puedes retirar tu dinero en cualquier momento."
        }
      ]
    }
  ];

  const quickLinks = [
    { title: "Cómo Funciona", href: "/como-funciona", icon: HelpCircle },
    { title: "Garantías", href: "/garantias", icon: MessageCircle },
    { title: "Blog", href: "/blog", icon: FileQuestion },
    { title: "Contacto", href: "/contacto", icon: Mail }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero */}
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
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-3xl mb-6 shadow-xl"
            >
              <HelpCircle className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              ¿En qué podemos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-500 dark:to-orange-400">
                ayudarte?
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Encuentra respuestas rápidas a las preguntas más frecuentes
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Buscar en la ayuda..."
                  className="h-14 pl-14 pr-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-2xl shadow-lg text-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {quickLinks.map((link, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={link.href}>
                  <div className="group h-full bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 transition-all hover:-translate-y-1">
                    <link.icon className="h-8 w-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                      {link.title}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {categories.map((category, catIndex) => (
              <motion.div
                key={catIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl">
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {category.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = catIndex * 100 + faqIndex;
                    const isOpen = openFaq === globalIndex;

                    return (
                      <div
                        key={faqIndex}
                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : globalIndex)}
                          className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <span className="font-semibold text-slate-900 dark:text-white pr-4">
                            {faq.q}
                          </span>
                          <ChevronDown
                            className={`h-5 w-5 text-orange-500 flex-shrink-0 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              ¿No encontraste lo que buscabas?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              Nuestro equipo de soporte está listo para ayudarte
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contacto">
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold shadow-lg">
                  <Mail className="mr-2 h-5 w-5" />
                  Contactar Soporte
                </Button>
              </Link>
              <a href="tel:+5491123456789">
                <Button variant="outline" size="lg" className="h-14 px-8 border-2 border-orange-500 text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 font-semibold">
                  <Phone className="mr-2 h-5 w-5" />
                  Llamar Ahora
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
