'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    setIsLoading(false);
  }, [session, status, router]);

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-dark-gray">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-secondary mb-6">My Profile</h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">
                    {session.user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-secondary">{session.user.name}</h2>
                  <p className="text-dark-gray">{session.user.email}</p>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-primary text-white rounded-full mt-1">
                    {session.user.role || 'user'}
                  </span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-secondary">Account Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-dark-gray">Full Name</label>
                      <p className="text-secondary">{session.user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dark-gray">Email Address</label>
                      <p className="text-secondary">{session.user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dark-gray">Account Type</label>
                      <p className="text-secondary capitalize">{session.user.role || 'user'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-secondary">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                      📦 View Orders
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                      🛒 Shopping Cart
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                      ⚙️ Account Settings
                    </button>
                    <button 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-3 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
