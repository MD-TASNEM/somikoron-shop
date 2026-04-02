import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-premium shadow-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <ShoppingBag className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold text-secondary">Forgot Password</h2>
          <p className="mt-2 text-sm text-secondary/60">Enter your email to receive a reset link</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40" />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Email Address"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 group disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
            {!loading && <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
