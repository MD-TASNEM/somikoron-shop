'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Phone, Store } from 'lucide-react';
import { registerSchema } from '@/lib/validations/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', phone: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (!res.ok) { setServerError(result.message || 'Registration failed'); return; }
      router.push('/login?registered=true');
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
          <h2 className="text-3xl font-bold text-secondary mb-2">সমীকরণ শপে যোগ দিন</h2>
          <p className="text-dark-gray">Create your account</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{serverError}</div>}

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-dark-gray" />
                <input type="text" {...register('name')} className={`w-full pl-10 pr-3 py-3 border rounded-md focus:ring-primary focus:border-primary ${errors.name ? 'border-red-500' : 'border-medium-gray'}`} placeholder="Your full name" />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-dark-gray" />
                <input type="email" {...register('email')} className={`w-full pl-10 pr-3 py-3 border rounded-md focus:ring-primary focus:border-primary ${errors.email ? 'border-red-500' : 'border-medium-gray'}`} placeholder="your@email.com" />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Phone (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-dark-gray" />
                <input type="tel" {...register('phone')} className="w-full pl-10 pr-3 py-3 border border-medium-gray rounded-md focus:ring-primary focus:border-primary" placeholder="01XXXXXXXXX" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-dark-gray" />
                <input type="password" {...register('password')} className={`w-full pl-10 pr-3 py-3 border rounded-md focus:ring-primary focus:border-primary ${errors.password ? 'border-red-500' : 'border-medium-gray'}`} placeholder="Min 6 characters" />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn btn-primary">
              {isLoading ? <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span className="ml-2">Creating account...</span></div> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-gray">Already have an account? <Link href="/login" className="font-medium text-primary hover:text-primary-dark">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
