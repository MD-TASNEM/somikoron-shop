import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShoppingBag, Mail, Lock, ArrowRight, Chrome } from 'lucide-react';
import { toast } from 'react-toastify';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await googleLogin();
      toast.success('Logged in with Google!');
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      toast.error('Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-premium shadow-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <ShoppingBag className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold text-secondary">Login to Somikoron Shop</h2>
          <p className="mt-2 text-sm text-secondary/60">Please sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-secondary/20 text-primary focus:ring-primary" />
              <span className="text-secondary/60">Remember me</span>
            </label>
            <Link to="/forgot-password" data-id="forgot-password-link" className="font-bold text-primary hover:underline">Forgot password?</Link>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 group disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className="w-full bg-white border-2 border-secondary/10 text-secondary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/5 transition-all disabled:opacity-50"
            >
              <Chrome className="w-5 h-5 text-primary" />
              {googleLoading ? 'Connecting...' : 'Google Login'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-secondary/60">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
};
