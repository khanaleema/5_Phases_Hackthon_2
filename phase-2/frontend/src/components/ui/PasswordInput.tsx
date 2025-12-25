'use client';

import * as React from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showStrength?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, helperText, showStrength = false, value, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    // Calculate password strength
    const getPasswordStrength = (pwd: string) => {
      if (!pwd) return { strength: 0, label: '', color: '', checks: [] };
      
      const checks = {
        length: pwd.length >= 8,
        uppercase: /[A-Z]/.test(pwd),
        lowercase: /[a-z]/.test(pwd),
        number: /[0-9]/.test(pwd),
        special: /[^A-Za-z0-9]/.test(pwd),
      };
      
      const passedChecks = Object.values(checks).filter(Boolean).length;
      let strength = 0;
      let label = '';
      let color = '';
      
      if (passedChecks <= 2) {
        strength = 1;
        label = 'Weak';
        color = 'bg-red-500';
      } else if (passedChecks <= 4) {
        strength = 2;
        label = 'Medium';
        color = 'bg-yellow-500';
      } else {
        strength = 3;
        label = 'Strong';
        color = 'bg-green-500';
      }
      
      return { strength, label, color, checks };
    };

    const passwordStrength = showStrength ? getPasswordStrength(value) : null;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-900 dark:text-white mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id={inputId}
            value={value}
            className={cn(
              'flex h-10 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-2 pr-10 pl-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition',
              error && 'border-red-500 focus-visible:ring-red-600',
              className
            )}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {showStrength && value && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    passwordStrength?.color || 'bg-slate-300'
                  )}
                  style={{ width: `${((passwordStrength?.strength || 0) / 3) * 100}%` }}
                />
              </div>
              {passwordStrength && passwordStrength.strength > 0 && (
                <span className={cn(
                  'text-xs font-medium',
                  passwordStrength.strength === 1 && 'text-red-600 dark:text-red-400',
                  passwordStrength.strength === 2 && 'text-yellow-600 dark:text-yellow-400',
                  passwordStrength.strength === 3 && 'text-green-600 dark:text-green-400'
                )}>
                  {passwordStrength.label}
                </span>
              )}
            </div>
            
            {/* Password Requirements */}
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className={cn(
                'flex items-center gap-1.5',
                passwordStrength?.checks.length ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-zinc-600'
              )}>
                {passwordStrength?.checks.length ? (
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-3 h-3 text-slate-300 dark:text-zinc-700" />
                )}
                <span>8+ characters</span>
              </div>
              <div className={cn(
                'flex items-center gap-1.5',
                passwordStrength?.checks.uppercase ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-zinc-600'
              )}>
                {passwordStrength?.checks.uppercase ? (
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-3 h-3 text-slate-300 dark:text-zinc-700" />
                )}
                <span>Uppercase</span>
              </div>
              <div className={cn(
                'flex items-center gap-1.5',
                passwordStrength?.checks.lowercase ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-zinc-600'
              )}>
                {passwordStrength?.checks.lowercase ? (
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-3 h-3 text-slate-300 dark:text-zinc-700" />
                )}
                <span>Lowercase</span>
              </div>
              <div className={cn(
                'flex items-center gap-1.5',
                passwordStrength?.checks.number ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-zinc-600'
              )}>
                {passwordStrength?.checks.number ? (
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-3 h-3 text-slate-300 dark:text-zinc-700" />
                )}
                <span>Number</span>
              </div>
              <div className={cn(
                'flex items-center gap-1.5 col-span-2',
                passwordStrength?.checks.special ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-zinc-600'
              )}>
                {passwordStrength?.checks.special ? (
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-3 h-3 text-slate-300 dark:text-zinc-700" />
                )}
                <span>Special character</span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-500">
            {error}
          </p>
        )}
        {helperText && !error && !showStrength && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };

