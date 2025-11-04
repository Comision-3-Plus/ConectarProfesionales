import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CursorGlow } from "@/components/features/CursorGlow";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import {
  generateSEO,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateServiceSchema,
} from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

// Metadatos principales optimizados para SEO
export const metadata: Metadata = generateSEO({
  title: "Encuentra el Profesional Perfecto para tu Proyecto",
  description: "Conecta con profesionales verificados en desarrollo, diseño, marketing y más. Pago seguro con escrow. Miles de proyectos exitosos. ¡Comienza gratis!",
  keywords: [
    "contratar desarrolladores",
    "freelancers verificados",
    "servicios profesionales online",
    "marketplace freelance Argentina",
    "pago seguro freelance",
  ],
});

// Configuración del viewport
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schemas de datos estructurados para SEO
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const serviceSchema = generateServiceSchema();

  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Datos Estructurados (JSON-LD) para Google */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <Script
          id="service-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceSchema),
          }}
        />
        
        <Providers>
          <ErrorBoundary>
            <CursorGlow />
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster position="top-right" richColors />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
