"use client";

import { motion } from "framer-motion";
import { FileText, User, Briefcase, DollarSign, Shield, AlertTriangle, Scale, Ban } from "lucide-react";

export default function TerminosPage() {
  const sections = [
    {
      icon: User,
      title: "Aceptación de los Términos",
      content: [
        "Al acceder y usar ConectarPro, aceptas estar sujeto a estos Términos y Condiciones",
        "Si no estás de acuerdo, no uses la plataforma",
        "Nos reservamos el derecho de modificar estos términos en cualquier momento",
        "Tu uso continuado después de cambios constituye aceptación de los nuevos términos",
        "Debes ser mayor de 18 años para usar ConectarPro"
      ]
    },
    {
      icon: Briefcase,
      title: "Uso de la Plataforma",
      content: [
        "ConectarPro es una plataforma que conecta clientes con profesionales independientes",
        "No somos empleadores ni empleados de los profesionales registrados",
        "Los profesionales son contratistas independientes responsables de sus servicios",
        "Debes usar la plataforma solo para fines legales y autorizados",
        "Está prohibido usar la plataforma para actividades fraudulentas o ilegales"
      ]
    },
    {
      icon: DollarSign,
      title: "Pagos y Comisiones",
      content: [
        "ConectarPro cobra una comisión del 10% sobre cada transacción completada",
        "Los pagos se procesan a través de MercadoPago de forma segura",
        "El dinero se retiene en depósito hasta que el cliente apruebe el trabajo",
        "Los profesionales pueden retirar sus fondos en cualquier momento",
        "Todas las tarifas se muestran claramente antes de completar una transacción",
        "Los reembolsos están sujetos a nuestra política de garantía"
      ]
    },
    {
      icon: Shield,
      title: "Responsabilidades del Usuario",
      content: [
        "Proporcionar información precisa y actualizada en tu perfil",
        "Mantener la confidencialidad de tu cuenta y contraseña",
        "Cumplir con todos los acuerdos establecidos con otros usuarios",
        "No suplantar la identidad de otras personas o entidades",
        "Respetar los derechos de propiedad intelectual de terceros",
        "Reportar cualquier actividad sospechosa o violación de términos"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Limitación de Responsabilidad",
      content: [
        "ConectarPro actúa como intermediario entre clientes y profesionales",
        "No garantizamos la calidad, seguridad o legalidad de los servicios ofrecidos",
        "No somos responsables de disputas entre usuarios",
        "Ofrecemos mediación pero no garantizamos resolución de conflictos",
        "No nos hacemos responsables por pérdidas indirectas o consecuenciales",
        "Nuestra responsabilidad máxima se limita al monto de la transacción en cuestión"
      ]
    },
    {
      icon: Ban,
      title: "Conductas Prohibidas",
      content: [
        "Publicar contenido falso, engañoso o fraudulento",
        "Acosar, amenazar o intimidar a otros usuarios",
        "Usar la plataforma para spam o publicidad no autorizada",
        "Intentar acceder a cuentas de otros usuarios sin autorización",
        "Evadir las tarifas de la plataforma mediante acuerdos externos",
        "Usar bots, scrapers u otras herramientas automatizadas sin permiso"
      ]
    },
    {
      icon: Scale,
      title: "Propiedad Intelectual",
      content: [
        "Todo el contenido de ConectarPro está protegido por derechos de autor",
        "Los usuarios retienen los derechos de su contenido original",
        "Al publicar contenido, otorgas a ConectarPro licencia para mostrarlo",
        "No puedes copiar, modificar o distribuir nuestro contenido sin permiso",
        "Las marcas comerciales de ConectarPro son de nuestra propiedad exclusiva",
        "Respetamos los derechos de propiedad intelectual de terceros"
      ]
    },
    {
      icon: FileText,
      title: "Terminación de Cuenta",
      content: [
        "Puedes cancelar tu cuenta en cualquier momento desde la configuración",
        "Nos reservamos el derecho de suspender o cerrar cuentas que violen estos términos",
        "La terminación no afecta obligaciones ya contraídas",
        "Podemos retener cierta información según requisitos legales",
        "Las disposiciones sobre limitación de responsabilidad sobreviven la terminación",
        "Puedes solicitar la eliminación completa de tus datos personales"
      ]
    }
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
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-blue-500 dark:from-orange-600 dark:to-blue-600 rounded-3xl mb-6 shadow-xl"
            >
              <Scale className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Términos y{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-blue-500 dark:from-orange-500 dark:to-blue-400">
                Condiciones
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-4">
              Estos términos establecen las reglas para el uso de ConectarPro.
              Por favor, léelos cuidadosamente.
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
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-blue-500 dark:from-orange-600 dark:to-blue-600 rounded-xl shrink-0">
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white pt-1">
                    {section.title}
                  </h2>
                </div>

                <ul className="space-y-3 ml-16">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0"></div>
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
              ¿Preguntas sobre los Términos?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              Si tienes dudas sobre nuestros términos y condiciones, contáctanos.
            </p>
            <a
              href="mailto:legal@conectarpro.com"
              className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-500 font-semibold hover:underline"
            >
              legal@conectarpro.com
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
