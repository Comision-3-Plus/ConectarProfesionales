/**
 * Componente UI: Input con icono
 * Componente "tonto" - solo presentación, sin lógica de negocio
 */

import React from 'react';
import { Input } from './input';
import type { LucideIcon } from 'lucide-react';

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  error?: boolean;
}

/**
 * Input con icono a la izquierda
 * @example
 * ```tsx
 * <InputWithIcon icon={Mail} placeholder="Email" />
 * ```
 */
export const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ icon: Icon, error, className = '', ...props }, ref) => {
    return (
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          ref={ref}
          className={`pl-10 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          } ${className}`}
          {...props}
        />
      </div>
    );
  }
);

InputWithIcon.displayName = 'InputWithIcon';
