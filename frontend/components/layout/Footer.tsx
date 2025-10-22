import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  MapPin, 
  Phone,
  Briefcase 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      {/* Newsletter Section */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Mantente al día con nosotros</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Recibe las últimas noticias, consejos y ofertas especiales directamente en tu correo.
            </p>
            <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Input
                type="email"
                placeholder="Tu correo electrónico"
                className="sm:w-80"
              />
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Suscribirse
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex items-center justify-center h-10 w-10 bg-orange-500 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Conectar<span className="text-orange-500 dark:text-orange-400">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              La plataforma líder que conecta profesionales talentosos con clientes que buscan calidad y confianza.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                <a href="mailto:contacto@conectarpro.com" className="hover:text-orange-500 dark:hover:text-orange-400">
                  contacto@conectarpro.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Phone className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                <a href="tel:+5491123456789" className="hover:text-orange-500 dark:hover:text-orange-400">
                  +54 9 11 2345-6789
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                <span>Buenos Aires, Argentina</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex space-x-3 pt-2">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all hover:border-orange-500 dark:hover:border-orange-400 hover:text-orange-500 dark:hover:text-orange-400 hover:shadow-md"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:border-orange-500 hover:text-orange-500 hover:shadow-md"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:border-orange-500 hover:text-orange-500 hover:shadow-md"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:border-orange-500 hover:text-orange-500 hover:shadow-md"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links - Para Clientes */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Para Clientes</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/browse"
                  className="text-sm text-slate-600 dark:text-slate-400 transition-colors hover:text-orange-500 dark:hover:text-orange-400"
                >
                  Buscar Profesionales
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-slate-600 transition-colors hover:text-orange-500"
                >
                  Publicar un Proyecto
                </Link>
              </li>
              <li>
                <Link
                  href="/como-funciona"
                  className="text-sm text-slate-600 transition-colors hover:text-orange-500"
                >
                  Cómo Funciona
                </Link>
              </li>
              <li>
                <Link
                  href="/garantias"
                  className="text-sm text-slate-600 transition-colors hover:text-orange-500"
                >
                  Garantías
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Para Profesionales */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900">Para Profesionales</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/register"
                  className="text-sm text-slate-600 transition-colors hover:text-orange-500"
                >
                  Únete como Profesional
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/profesional"
                  className="text-sm text-slate-600 transition-colors hover:text-orange-500"
                >
                  Mi Panel
                </Link>
              </li>
              <li>
                <Link
                  href="/herramientas"
                  className="text-sm text-slate-600 transition-colors hover:text-orange-500"
                >
                  Herramientas
                </Link>
              </li>
              <li>
                <Link
                  href="/recursos"
                  className="text-sm text-slate-600 transition-colors hover:text-orange-500"
                >
                  Recursos
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Empresa */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900">Empresa</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/nosotros"
                  className="text-sm text-slate-600 transition-colors hover:text-orange-500"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-slate-600 transition-colors hover:text-orange-500"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/ayuda"
                  className="text-sm text-slate-600 transition-colors hover:text-orange-500"
                >
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-sm text-slate-600 transition-colors hover:text-orange-500"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()} ConectarPro. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/privacidad" className="text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400">
                Privacidad
              </Link>
              <Link href="/terminos" className="text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400">
                Términos de Servicio
              </Link>
              <Link href="/cookies" className="text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
