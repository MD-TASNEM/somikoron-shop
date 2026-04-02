import React from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Shield, LogOut, Package, MapPin, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-premium shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-8 text-white flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border-4 border-white/30">
            <User className="w-12 h-12" />
          </div>
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl font-extrabold">{user?.name}</h1>
            <p className="text-white/80 flex items-center justify-center md:justify-start gap-2 mt-1">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest">
                {user?.role}
              </span>
              {user?.role === 'admin' && (
                <Link to="/admin" className="px-3 py-1 bg-secondary text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary/90 transition-all">
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
          <button 
            onClick={logout}
            className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" /> Account Details
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/5 rounded-xl">
                <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Full Name</p>
                <p className="font-bold text-secondary">{user?.name}</p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-xl">
                <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Email Address</p>
                <p className="font-bold text-secondary">{user?.email}</p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-xl">
                <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Account Type</p>
                <p className="font-bold text-secondary capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <Link to="/orders" className="p-6 border border-secondary/10 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold">My Orders</p>
                      <p className="text-xs text-secondary/60">View and track your purchases</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-secondary/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
              <Link to="#" className="p-6 border border-secondary/10 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group opacity-50 cursor-not-allowed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold">Address Book</p>
                      <p className="text-xs text-secondary/60">Manage your shipping addresses</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-secondary/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
