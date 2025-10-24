import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  MapPin, 
  Phone,
  Briefcase,
  Shield,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500"></div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative flex items-center justify-center h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold">
                <span className="text-slate-900 dark:text-white">Conectar</span>
                <span className="text-orange-500 dark:text-orange-400">Pro</span>
              </span>
            </Link>
            
            <p className="text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
              La plataforma líder que conecta profesionales talentosos con clientes que buscan calidad y confianza en cada proyecto.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-full">
                <Shield className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Pago Seguro</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Verificado</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-full">
                <TrendingUp className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-medium text-orange-700 dark:text-orange-400">5000+ Usuarios</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 pt-2">
              <a 
                href="mailto:contacto@conectarpro.com" 
                className="group flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              >
                <div className="flex items-center justify-center h-8 w-8 bg-orange-100 dark:bg-orange-950/30 rounded-lg group-hover:bg-orange-500 dark:group-hover:bg-orange-500 transition-colors">
                  <Mail className="h-4 w-4 text-orange-600 dark:text-orange-400 group-hover:text-white transition-colors" />
                </div>
                <span className="font-medium">contacto@conectarpro.com</span>
              </a>
              <a 
                href="tel:+5491123456789" 
                className="group flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              >
                <div className="flex items-center justify-center h-8 w-8 bg-orange-100 dark:bg-orange-950/30 rounded-lg group-hover:bg-orange-500 dark:group-hover:bg-orange-500 transition-colors">
                  <Phone className="h-4 w-4 text-orange-600 dark:text-orange-400 group-hover:text-white transition-colors" />
                </div>
                <span className="font-medium">+54 9 11 2345-6789</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-center h-8 w-8 bg-orange-100 dark:bg-orange-950/30 rounded-lg">
                  <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="font-medium">Buenos Aires, Argentina</span>
              </div>
            </div>
          </div>

          {/* Links - Para Clientes */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Para Clientes</h4>
            <ul className="space-y-3">
              {[
                { href: '/browse', label: 'Buscar Profesionales' },
                { href: '/register', label: 'Publicar Proyecto' },
                { href: '/como-funciona', label: 'Cómo Funciona' },
                { href: '/garantias', label: 'Garantías' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Para Profesionales */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Para Profesionales</h4>
            <ul className="space-y-3">
              {[
                { href: '/register', label: 'Únete Ahora' },
                { href: '/dashboard/profesional', label: 'Mi Panel' },
                { href: '/herramientas', label: 'Herramientas' },
                { href: '/recursos', label: 'Recursos' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Empresa */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Empresa</h4>
            <ul className="space-y-3">
              {[
                { href: '/sobre-nosotros', label: 'Sobre Nosotros' },
                { href: '/blog', label: 'Blog' },
                { href: '/ayuda', label: 'Ayuda' },
                { href: '/contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {[
                { href: '/privacidad', label: 'Privacidad' },
                { href: '/terminos', label: 'Términos' },
                { href: '/cookies', label: 'Cookies' },
                { href: '/licencias', label: 'Licencias' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-center gap-6">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Síguenos en redes sociales</p>
            <div className="flex space-x-3">
              {[
                { icon: Facebook, label: 'Facebook', href: '#', color: 'hover:bg-blue-600' },
                { icon: Twitter, label: 'Twitter', href: '#', color: 'hover:bg-sky-500' },
                { icon: Instagram, label: 'Instagram', href: '#', color: 'hover:bg-pink-600' },
                { icon: Linkedin, label: 'LinkedIn', href: '#', color: 'hover:bg-blue-700' },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className={`group flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all hover:border-transparent hover:text-white hover:scale-110 hover:shadow-lg ${social.color}`}
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()} <span className="font-semibold text-slate-900 dark:text-white">ConectarPro</span>. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
