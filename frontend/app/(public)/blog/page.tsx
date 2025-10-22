"use client";

import { motion } from "framer-motion";
import { BookOpen, Calendar, Clock, User, ArrowRight, TrendingUp, Lightbulb, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BlogPage() {
  const featuredPost = {
    title: "Cómo elegir el profesional perfecto para tu proyecto",
    excerpt: "Una guía completa con consejos prácticos para tomar la mejor decisión al contratar servicios profesionales.",
    category: "Guías",
    date: "15 Oct 2025",
    readTime: "8 min",
    author: "María González",
    image: "featured"
  };

  const posts = [
    {
      title: "10 consejos para destacar tu perfil profesional",
      excerpt: "Aprende las mejores prácticas para que tu perfil atraiga más clientes y genere más oportunidades.",
      category: "Para Profesionales",
      date: "12 Oct 2025",
      readTime: "5 min",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Seguridad en pagos online: Todo lo que debes saber",
      excerpt: "Descubre cómo proteger tus transacciones y realizar pagos seguros en plataformas digitales.",
      category: "Seguridad",
      date: "10 Oct 2025",
      readTime: "6 min",
      icon: Shield,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Tendencias del mercado freelance en 2025",
      excerpt: "Análisis de las profesiones más demandadas y cómo adaptarte a los cambios del mercado.",
      category: "Tendencias",
      date: "8 Oct 2025",
      readTime: "7 min",
      icon: Lightbulb,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Cómo fijar precios competitivos para tus servicios",
      excerpt: "Estrategias para establecer tarifas que reflejen tu valor sin perder competitividad.",
      category: "Para Profesionales",
      date: "5 Oct 2025",
      readTime: "6 min",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Maximiza tu productividad trabajando remotamente",
      excerpt: "Herramientas y técnicas para mantener la eficiencia desde cualquier lugar.",
      category: "Productividad",
      date: "3 Oct 2025",
      readTime: "5 min",
      icon: Zap,
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: "Construye relaciones duraderas con tus clientes",
      excerpt: "Estrategias de comunicación y servicio al cliente que generan lealtad y recomendaciones.",
      category: "Para Profesionales",
      date: "1 Oct 2025",
      readTime: "7 min",
      icon: TrendingUp,
      color: "from-pink-500 to-pink-600"
    }
  ];

  const categories = [
    "Todos",
    "Guías",
    "Para Profesionales",
    "Para Clientes",
    "Seguridad",
    "Tendencias",
    "Productividad"
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
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-3xl mb-6 shadow-xl"
            >
              <BookOpen className="h-10 w-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Blog de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-500 dark:to-orange-400">
                ConectarPro
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Consejos, guías y noticias para profesionales y clientes que quieren sacar el máximo provecho de la plataforma
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Buscar artículos..."
                  className="h-14 pl-6 pr-32 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-2xl shadow-lg text-lg"
                />
                <Button className="absolute right-2 top-2 h-10 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600">
                  Buscar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  index === 0
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 dark:hover:text-orange-500"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-500 px-4 py-2 rounded-full mb-8">
              <TrendingUp className="h-5 w-5" />
              <span className="font-semibold">Destacado</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <div className="inline-block bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-500 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  {featuredPost.category}
                </div>
                
                <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
                  {featuredPost.title}
                </h2>
                
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400 mb-8">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{featuredPost.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>

                <Button size="lg" className="group h-12 px-6 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold shadow-lg">
                  Leer Artículo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div>
                <div className="relative h-96 bg-gradient-to-br from-orange-200 to-blue-200 dark:from-orange-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center">
                  <BookOpen className="h-32 w-32 text-orange-500/50 dark:text-orange-500/30" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Últimos Artículos
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Mantente actualizado con nuestros consejos y guías
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {posts.map((post, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
              >
                <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                  {/* Image Placeholder */}
                  <div className={`relative h-48 bg-gradient-to-br ${post.color} flex items-center justify-center`}>
                    <post.icon className="h-16 w-16 text-white/50" />
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm text-slate-900 px-3 py-1 rounded-full text-xs font-semibold">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Button variant="outline" size="lg" className="h-12 px-8 border-2 border-orange-500 text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 font-semibold">
              Cargar Más Artículos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 p-12 md:p-16 text-center max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-blob"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                No te pierdas nada
              </h2>
              <p className="text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
                Suscríbete a nuestro newsletter y recibe los mejores consejos directo en tu email
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  className="h-12 bg-white/90 backdrop-blur-sm border-0 focus:bg-white text-slate-900"
                />
                <Button type="submit" size="lg" className="h-12 bg-white text-orange-600 hover:bg-orange-50 font-semibold whitespace-nowrap">
                  Suscribirse
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
