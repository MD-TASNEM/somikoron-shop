'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, Store } from 'lucide-react';
import { loginSchema } from '@/lib/validations/auth';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, clearErrors } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    clearErrors();
    try {
      const result = await signIn('credentials', { email: data.email, password: data.password, redirect: false });
      if (result?.error) {
        setServerError('Invalid email or password');
      } else {
        const session = await getSession();
        const redirectTo = searchParams.get('redirect') || (session?.user?.role === 'admin' ? '/admin' : '/profile');
        router.push(redirectTo);
      }
    } catch {
      setServerError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-6"><Store className="h-12 w-12 text-primary" /></div>
          <h2 className="text-3xl font-bold text-secondary mb-2">সমীকরণ শপ-এ লগইন করুন</h2>
          <p className="text-dark-gray">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {serverError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{serverError}</div>}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-dark-gray" />
                <input id="email" type="email" {...register('email')}
                  className={`w-full pl-10 pr-3 py-3 border rounded-md focus:ring-primary focus:border-primary ${errors.email ? 'border-red-500' : 'border-medium-gray'}`}
                  placeholder="Enter your email" autoComplete="email" />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-dark-gray" />
                <input id="password" type={showPassword ? 'text' : 'password'} {...register('password')}
                  className={`w-full pl-10 pr-10 py-3 border rounded-md focus:ring-primary focus:border-primary ${errors.password ? 'border-red-500' : 'border-medium-gray'}`}
                  placeholder="Enter your password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-dark-gray hover:text-primary">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn btn-primary">
              {isLoading
                ? <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span className="ml-2">Signing in...</span></div>
                : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-gray">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-primary hover:text-primary-dark">Sign up</Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-dark-gray hover:text-primary">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
