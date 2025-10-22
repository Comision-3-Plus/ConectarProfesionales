"use client";

import { motion } from "framer-motion";
import { Cookie, Settings, Eye, BarChart, Target, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    essential: true,
    functional: true,
    analytics: true,
    marketing: false
  });

  const cookieTypes = [
    {
      icon: Shield,
      id: "essential",
      title: "Cookies Esenciales",
      description: "Necesarias para el funcionamiento básico del sitio. No pueden desactivarse.",
      required: true,
      examples: [
        "Sesión de usuario autenticado",
        "Preferencias de idioma",
        "Seguridad y prevención de fraude",
        "Funcionalidad del carrito de compras"
      ],
      color: "from-green-500 to-green-600"
    },
    {
      icon: Settings,
      id: "functional",
      title: "Cookies Funcionales",
      description: "Mejoran tu experiencia recordando tus preferencias.",
      required: false,
      examples: [
        "Tema claro/oscuro",
        "Preferencias de notificación",
        "Configuración de privacidad",
        "Idioma seleccionado"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: BarChart,
      id: "analytics",
      title: "Cookies de Análisis",
      description: "Nos ayudan a entender cómo usas el sitio para mejorarlo.",
      required: false,
      examples: [
        "Páginas más visitadas",
        "Tiempo de navegación",
        "Fuente de tráfico",
        "Interacciones con elementos"
      ],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Target,
      id: "marketing",
      title: "Cookies de Marketing",
      description: "Permiten mostrar contenido y anuncios relevantes.",
      required: false,
      examples: [
        "Anuncios personalizados",
        "Remarketing",
        "Seguimiento de conversiones",
        "Redes sociales integradas"
      ],
      color: "from-orange-500 to-orange-600"
    }
  ];

  const handleSavePreferences = () => {
    // Aquí iría la lógica para guardar las preferencias
    console.log("Preferencias guardadas:", preferences);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-300/30 dark:bg-purple-600/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
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
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-purple-500 dark:from-orange-600 dark:to-purple-600 rounded-3xl mb-6 shadow-xl"
            >
              <Cookie className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Política de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-500 dark:from-orange-500 dark:to-purple-400">
                Cookies
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-4">
              Usamos cookies para mejorar tu experiencia. Aquí te explicamos qué son,
              cómo las usamos y cómo puedes controlarlas.
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Última actualización: 21 de Octubre de 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* What are Cookies */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-purple-500 rounded-xl shrink-0">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    ¿Qué son las Cookies?
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando
                    visitas un sitio web. Nos ayudan a recordar tus preferencias, mantener tu sesión activa
                    y entender cómo usas nuestra plataforma para poder mejorarla.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cookie Types */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Tipos de Cookies que Usamos
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Personaliza qué cookies quieres permitir
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {cookieTypes.map((cookie, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between gap-6 mb-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${cookie.color} rounded-xl shrink-0`}>
                      <cookie.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {cookie.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {cookie.description}
                      </p>
                      <ul className="space-y-2">
                        {cookie.examples.map((example, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0"></div>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {cookie.required ? (
                      <span className="px-4 py-2 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                        Requerido
                      </span>
                    ) : (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[cookie.id as keyof typeof preferences]}
                          onChange={(e) => setPreferences({ ...preferences, [cookie.id]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
                      </label>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mt-12 text-center"
          >
            <Button
              onClick={handleSavePreferences}
              size="lg"
              className="h-14 px-12 bg-gradient-to-r from-orange-600 to-purple-500 hover:from-orange-500 hover:to-purple-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              Guardar Preferencias
            </Button>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Tus preferencias se guardarán en este dispositivo
            </p>
          </motion.div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Control de Cookies en tu Navegador
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                La mayoría de los navegadores permiten controlar las cookies a través de sus configuraciones.
                Ten en cuenta que deshabilitar cookies puede afectar la funcionalidad del sitio.
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0"></div>
                  <span><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0"></div>
                  <span><strong>Firefox:</strong> Opciones → Privacidad y seguridad</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0"></div>
                  <span><strong>Safari:</strong> Preferencias → Privacidad</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0"></div>
                  <span><strong>Edge:</strong> Configuración → Privacidad → Cookies</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                ¿Preguntas sobre Cookies?
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                Si tienes dudas sobre nuestra política de cookies, contáctanos.
              </p>
              <a
                href="mailto:privacidad@conectarpro.com"
                className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-500 font-semibold hover:underline"
              >
                privacidad@conectarpro.com
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
