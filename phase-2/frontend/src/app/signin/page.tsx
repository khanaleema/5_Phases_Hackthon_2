'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { authClient } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { signInSchema, signUpSchema } from '@/lib/validation';
import { toast } from 'sonner';

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod
    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || '',
        password: fieldErrors.password?.[0] || '',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.error) {
        toast.error(result.error.message || 'Invalid email or password');
        return;
      }

      toast.success('Welcome back!');
      // Small delay to ensure session is set
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error?.message || error?.data?.message || 'Invalid email or password';
      toast.error(errorMessage);
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        setErrors({ 
          email: 'Account not found. Please sign up first.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod
    const result = signUpSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || '',
        password: fieldErrors.password?.[0] || '',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authClient.signUp.email({
        email: email.trim().toLowerCase(),
        password,
        name: name || email.split('@')[0], // Use email prefix if name not provided
      });

      if (response.error) {
        toast.error(response.error.message || 'Sign up failed. Please try again.');
        if (response.error.message?.includes('already exists') || response.error.message?.includes('EMAIL_ALREADY_EXISTS')) {
          setErrors({ email: 'This email is already registered. Try signing in instead.' });
        }
        return;
      }

      toast.success('Account created successfully!');
      // Small delay to ensure session is set
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = error?.message || error?.data?.message || 'Sign up failed. Please try again.';
      toast.error(errorMessage);
      if (errorMessage.includes('already exists') || errorMessage.includes('EMAIL_ALREADY_EXISTS')) {
        setErrors({ email: 'This email is already registered. Try signing in instead.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-zinc-950 dark:via-blue-950 dark:to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img 
                src="/image.png" 
                alt="TaskVault" 
                className="relative w-12 h-12 object-contain bg-transparent transform group-hover:scale-110 transition-transform" 
              />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TaskVault
            </span>
          </Link>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Modern Task Management
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-8 backdrop-blur-sm">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-zinc-800 rounded-lg">
            <button
              onClick={() => {
                setMode('signin');
                setErrors({});
                setPassword('');
              }}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-200',
                mode === 'signin'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrors({});
                setPassword('');
              }}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-200',
                mode === 'signup'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Sign Up
            </button>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {mode === 'signin'
                ? 'Sign in to access your tasks'
                : 'Get started with TaskVault today'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                placeholder="Your name"
                required
                autoComplete="name"
              />
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              showStrength={mode === 'signup'}
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-6"
              size="lg"
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-blue-600 dark:text-blue-500 font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-blue-600 dark:text-blue-500 font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Secured with JWT authentication and end-to-end encryption</span>
        </div>
      </div>
    </div>
  );
}
