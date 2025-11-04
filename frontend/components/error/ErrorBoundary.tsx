'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Enviar error a servicio de logging (Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined') {
      // TODO: Integrar con servicio de error tracking
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

// Componente de fallback por defecto
function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">¡Oops! Algo salió mal</CardTitle>
              <CardDescription>
                Lo sentimos, ocurrió un error inesperado. Nuestro equipo ha sido notificado.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDevelopment && error && (
            <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-sm text-slate-700 mb-2">Error Details (Dev Only):</h3>
              <pre className="text-xs text-slate-600 overflow-auto max-h-40">
                {error.toString()}
                {error.stack}
              </pre>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={onReset} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar de Nuevo
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir al Inicio
            </Button>
          </div>

          <p className="text-xs text-center text-slate-500">
            Si el problema persiste, por favor contacta a soporte: soporte@conectarprofesionales.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Export wrapper para poder usar hooks en el fallback si es necesario
export function ErrorBoundary({ children, fallback }: Props) {
  return (
    <ErrorBoundaryClass fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
}
