"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react";

export default function PrivacidadPage() {
  const sections = [
    {
      icon: Database,
      title: "Información que Recopilamos",
      content: [
        "Información de cuenta: nombre, email, teléfono, dirección",
        "Información de perfil: foto, descripción, habilidades, experiencia",
        "Información de uso: páginas visitadas, tiempo de navegación, clics",
        "Información de pago: datos necesarios para procesar transacciones (procesados por MercadoPago)",
        "Comunicaciones: mensajes entre usuarios, evaluaciones, comentarios"
      ]
    },
    {
      icon: Lock,
      title: "Cómo Usamos tu Información",
      content: [
        "Proporcionar y mejorar nuestros servicios",
        "Procesar transacciones y pagos de forma segura",
        "Enviar notificaciones sobre actividad de tu cuenta",
        "Personalizar tu experiencia en la plataforma",
        "Prevenir fraude y garantizar la seguridad",
        "Cumplir con obligaciones legales y regulatorias"
      ]
    },
    {
      icon: Eye,
      title: "Compartir tu Información",
      content: [
        "Con otros usuarios: tu perfil público es visible para facilitar la contratación",
        "Con procesadores de pago: MercadoPago para gestionar transacciones",
        "Con proveedores de servicios: hosting, análisis, soporte técnico",
        "Por requisitos legales: cuando la ley lo exija o para proteger derechos",
        "No vendemos tu información personal a terceros bajo ninguna circunstancia"
      ]
    },
    {
      icon: Shield,
      title: "Seguridad de tus Datos",
      content: [
        "Encriptación SSL de 256 bits en todas las comunicaciones",
        "Servidores seguros con protección contra accesos no autorizados",
        "Autenticación de dos factores disponible",
        "Auditorías de seguridad regulares",
        "Equipo dedicado de seguridad 24/7",
        "Cumplimiento con estándares internacionales de protección de datos"
      ]
    },
    {
      icon: UserCheck,
      title: "Tus Derechos",
      content: [
        "Acceder a tu información personal en cualquier momento",
        "Corregir datos inexactos o incompletos",
        "Solicitar la eliminación de tu cuenta y datos",
        "Exportar tus datos en formato portable",
        "Optar por no recibir comunicaciones de marketing",
        "Presentar quejas ante autoridades de protección de datos"
      ]
    },
    {
      icon: FileText,
      title: "Cookies y Tecnologías Similares",
      content: [
        "Usamos cookies para mejorar tu experiencia de navegación",
        "Cookies esenciales: necesarias para el funcionamiento del sitio",
        "Cookies de análisis: para entender cómo usas la plataforma",
        "Cookies de marketing: para mostrar contenido relevante",
        "Puedes gestionar tus preferencias de cookies en cualquier momento",
        "Ver nuestra Política de Cookies para más detalles"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-green-300/30 dark:bg-green-600/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
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
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 rounded-3xl mb-6 shadow-xl"
            >
              <Shield className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Política de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 dark:from-blue-500 dark:to-green-400">
                Privacidad
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-4">
              Tu privacidad es nuestra prioridad. Esta política explica cómo recopilamos,
              usamos y protegemos tu información personal.
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Última actualización: 21 de Octubre de 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 rounded-xl shrink-0">
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white pt-1">
                    {section.title}
                  </h2>
                </div>

                <ul className="space-y-3 ml-16">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                      <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
              ¿Preguntas sobre Privacidad?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              Si tienes alguna duda sobre nuestra política de privacidad o cómo manejamos tus datos,
              no dudes en contactarnos.
            </p>
            <a
              href="mailto:privacidad@conectarpro.com"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-500 font-semibold hover:underline"
            >
              privacidad@conectarpro.com
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
