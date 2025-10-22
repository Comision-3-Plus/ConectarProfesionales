"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactoPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: "contacto@conectarpro.com",
      description: "Respuesta en 24 horas",
      href: "mailto:contacto@conectarpro.com",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Phone,
      title: "Teléfono",
      value: "+54 9 11 2345-6789",
      description: "Lun - Vie, 9am - 6pm",
      href: "tel:+5491123456789",
      color: "from-green-500 to-green-600"
    },
    {
      icon: MapPin,
      title: "Oficina",
      value: "Buenos Aires, Argentina",
      description: "Visita con cita previa",
      href: "#",
      color: "from-orange-500 to-orange-600"
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
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-3xl mb-6 shadow-xl"
            >
              <MessageCircle className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Hablemos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-500 dark:to-orange-400">
                juntos
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {contactMethods.map((method, index) => (
              <motion.a
                key={index}
                href={method.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group block"
              >
                <div className="h-full bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 transition-all">
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${method.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                    <method.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {method.title}
                  </h3>
                  <p className="text-orange-600 dark:text-orange-500 font-semibold mb-1">
                    {method.value}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {method.description}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-200 dark:border-slate-700"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                  Envíanos un mensaje
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Completa el formulario y nuestro equipo te contactará pronto
                </p>
              </div>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Nombre
                    </label>
                    <Input
                      type="text"
                      placeholder="Tu nombre"
                      className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Asunto
                  </label>
                  <Input
                    type="text"
                    placeholder="¿En qué podemos ayudarte?"
                    className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Mensaje
                  </label>
                  <Textarea
                    placeholder="Cuéntanos más detalles..."
                    rows={6}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Send className="mr-2 h-5 w-5" />
                  Enviar Mensaje
                </Button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Te responderemos en un máximo de 24 horas hábiles
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                Nuestra Ubicación
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Buenos Aires, Argentina
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-200 to-blue-200 dark:from-orange-900/30 dark:to-blue-900/30 rounded-3xl h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-20 w-20 text-orange-500/50 dark:text-orange-500/30 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                  Mapa interactivo próximamente
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
