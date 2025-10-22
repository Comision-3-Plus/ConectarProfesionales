"use client";

import { motion } from "framer-motion";
import { FileCheck, Code, Palette, BookOpen, Shield, ExternalLink } from "lucide-react";

export default function LicenciasPage() {
  const licenses = [
    {
      icon: Code,
      title: "Next.js",
      version: "15.5.6",
      license: "MIT License",
      description: "Framework de React para producción",
      link: "https://github.com/vercel/next.js/blob/canary/license.md",
      color: "from-black to-slate-700"
    },
    {
      icon: Code,
      title: "React",
      version: "19.0.0",
      license: "MIT License",
      description: "Biblioteca de JavaScript para construir interfaces de usuario",
      link: "https://github.com/facebook/react/blob/main/LICENSE",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Palette,
      title: "Tailwind CSS",
      version: "4.0.0",
      license: "MIT License",
      description: "Framework CSS utility-first",
      link: "https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: Code,
      title: "Framer Motion",
      version: "Latest",
      license: "MIT License",
      description: "Biblioteca de animaciones para React",
      link: "https://github.com/framer/motion/blob/main/LICENSE",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: BookOpen,
      title: "Lucide React",
      version: "Latest",
      license: "ISC License",
      description: "Iconos SVG hermosos y consistentes",
      link: "https://github.com/lucide-icons/lucide/blob/main/LICENSE",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Code,
      title: "TypeScript",
      version: "Latest",
      license: "Apache License 2.0",
      description: "JavaScript con sintaxis de tipado",
      link: "https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt",
      color: "from-blue-600 to-blue-700"
    }
  ];

  const ownLicense = {
    title: "ConectarPro",
    copyright: "© 2025 ConectarPro. Todos los derechos reservados.",
    description: "El código fuente de ConectarPro es propiedad exclusiva de ConectarPro y está protegido por leyes de derechos de autor. No está permitido copiar, modificar, distribuir o vender ninguna parte del código sin autorización expresa por escrito.",
    restrictions: [
      "No está permitido reproducir el código fuente sin permiso",
      "No se permite el uso comercial sin licencia",
      "Las marcas comerciales de ConectarPro están protegidas",
      "El contenido generado por usuarios pertenece a sus respectivos autores",
      "Todas las integraciones de terceros están sujetas a sus propias licencias"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
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
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 rounded-3xl mb-6 shadow-xl"
            >
              <FileCheck className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Licencias y{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-500 dark:to-blue-400">
                Atribuciones
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-4">
              ConectarPro utiliza software de código abierto. Aquí reconocemos y
              agradecemos a todos los proyectos que hacen posible nuestra plataforma.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our License */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 rounded-3xl p-8 text-white shadow-xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl shrink-0">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {ownLicense.title}
                  </h2>
                  <p className="text-purple-100 text-sm mb-4">
                    {ownLicense.copyright}
                  </p>
                </div>
              </div>

              <p className="text-purple-50 mb-6 leading-relaxed">
                {ownLicense.description}
              </p>

              <ul className="space-y-3">
                {ownLicense.restrictions.map((restriction, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 shrink-0"></div>
                    <span className="text-purple-50">{restriction}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Third Party Licenses */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Licencias de Terceros
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Software de código abierto que utilizamos con agradecimiento
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {licenses.map((lib, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${lib.color} rounded-xl shrink-0 group-hover:scale-110 transition-transform`}>
                      <lib.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold">
                      {lib.license}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {lib.title}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Versión: {lib.version}
                  </p>

                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {lib.description}
                  </p>

                  <a
                    href={lib.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-500 hover:text-purple-700 dark:hover:text-purple-400 font-semibold text-sm transition-colors"
                  >
                    Ver Licencia
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MIT License Example */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Sobre la Licencia MIT
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                La mayoría de las bibliotecas que usamos están bajo la Licencia MIT, una de las
                licencias de software libre más permisivas. Esta licencia permite:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 shrink-0"></div>
                  <span className="text-slate-700 dark:text-slate-300">Uso comercial y privado</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 shrink-0"></div>
                  <span className="text-slate-700 dark:text-slate-300">Modificación del código</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 shrink-0"></div>
                  <span className="text-slate-700 dark:text-slate-300">Distribución</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 shrink-0"></div>
                  <span className="text-slate-700 dark:text-slate-300">Sin garantías expresas o implícitas</span>
                </li>
              </ul>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Agradecemos a la comunidad de código abierto por hacer posible proyectos como ConectarPro.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
              ¿Preguntas sobre Licencias?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              Si tienes dudas sobre licencias o atribuciones, contáctanos.
            </p>
            <a
              href="mailto:legal@conectarpro.com"
              className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-500 font-semibold hover:underline"
            >
              legal@conectarpro.com
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
