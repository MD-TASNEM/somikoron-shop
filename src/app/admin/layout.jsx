'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  TrendingUp,
  AlertCircle,
  ChevronDown
} from 'lucide-react';



export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [expandedItems, setExpandedItems] = useState([]);

  // Check admin status using session
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (status === 'loading') return;

        if (!session) {
          router.push('/login?redirect=' + encodeURIComponent(pathname));
          return;
        }

        if ((session.user).role !== 'admin') {
          router.push('/');
          return;
        }

        setUserProfile(session.user);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error checking admin status:', error);
        router.push('/');
      }
    };

    checkAdminStatus();
  }, [session, status, router, pathname]);

  // Navigation items
  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: <Package className="h-5 w-5" />,
      subItems: [
        { name: 'All Products', href: '/admin/products' },
        { name: 'Add Product', href: '/admin/products/new' },
        { name: 'Categories', href: '/admin/products/categories' }
      ]
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      badge: 'pending', // This would be dynamic in a real app
      subItems: [
        { name: 'All Orders', href: '/admin/orders' },
        { name: 'Pending', href: '/admin/orders?status=pending' },
        { name: 'Processing', href: '/admin/orders?status=processing' },
        { name: 'Shipped', href: '/admin/orders?status=shipped' },
        { name: 'Delivered', href: '/admin/orders?status=delivered' },
        { name: 'Cancelled', href: '/admin/orders?status=cancelled' }
      ]
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      subItems: [
        { name: 'All Users', href: '/admin/users' },
        { name: 'Customers', href: '/admin/users?role=user' },
        { name: 'Admins', href: '/admin/users?role=admin' }
      ]
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: <TrendingUp className="h-5 w-5" />,
      subItems: [
        { name: 'Overview', href: '/admin/analytics' },
        { name: 'Sales', href: '/admin/analytics/sales' },
        { name: 'Products', href: '/admin/analytics/products' },
        { name: 'Users', href: '/admin/analytics/users' }
      ]
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: <FileText className="h-5 w-5" />,
      subItems: [
        { name: 'Sales Report', href: '/admin/reports/sales' },
        { name: 'Inventory Report', href: '/admin/reports/inventory' },
        { name: 'User Report', href: '/admin/reports/users' }
      ]
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      subItems: [
        { name: 'General', href: '/admin/settings' },
        { name: 'Payment', href: '/admin/settings/payment' },
        { name: 'Shipping', href: '/admin/settings/shipping' },
        { name: 'Email', href: '/admin/settings/email' }
      ]
    }
  ];

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      router.push('/login');
    }
  };

  // Check if link is active
  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Toggle expanded items
  const toggleExpanded = (itemName) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent border-r-transparent border-b-transparent mx-auto mb-4"></div>
          <p className="text-lg text-dark-gray">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}>

        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-medium-gray">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-secondary">Admin Panel</h1>
              <p className="text-xs text-dark-gray">সমীকরণ শপ</p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-dark-gray" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const isItemActive = isActive(item.href);
            const isExpanded = expandedItems.includes(item.name);

            return (
              <div key={item.name}>
                {/* Main nav item */}
                <Link
                  href={item.href}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors duration-200 ${isItemActive
                    ? 'bg-primary text-white'
                    : 'text-dark-gray hover:bg-gray-100 hover:text-secondary'
                    }`}
                  onClick={() => {
                    if (item.subItems) {
                      toggleExpanded(item.name);
                    }
                    setSidebarOpen(false); // Close mobile sidebar after navigation
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className={`px-2 py-1 text-xs rounded-full ${isItemActive
                        ? 'bg-white/20 text-white'
                        : 'bg-red-100 text-red-600'
                        }`}>
                        {item.badge}
                      </span>
                    )}

                    {item.subItems && (
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                        }`} />
                    )}
                  </div>
                </Link>

                {/* Sub items */}
                {item.subItems && isExpanded && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.subItems.map((subItem) => {
                      const isSubActive = pathname === subItem.href;

                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${isSubActive
                            ? 'bg-primary/20 text-primary font-medium'
                            : 'text-dark-gray hover:bg-gray-100 hover:text-secondary'
                            }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-medium-gray">
          <div className="space-y-3">
            {/* User info */}
            {userProfile && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary truncate">
                    {userProfile.name}
                  </p>
                  <p className="text-xs text-dark-gray truncate">
                    {userProfile.email}
                  </p>
                </div>
              </div>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-3 py-2 text-dark-gray hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Logout</span>
            </button>

            {/* Back to site */}
            <Link
              href="/"
              className="flex items-center space-x-2 w-full px-3 py-2 text-dark-gray hover:bg-gray-100 hover:text-secondary rounded-lg transition-colors duration-200"
            >
              <Home className="h-4 w-4" />
              <span className="font-medium">Back to Site</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-medium-gray sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Menu className="h-5 w-5 text-dark-gray" />
            </button>

            {/* Header content */}
            <div className="flex items-center justify-between w-full">
              <div className="flex-1 lg:hidden"></div>

              <div className="flex items-center space-x-4">
                {/* User info (mobile) */}
                {userProfile && (
                  <div className="flex items-center space-x-2 lg:hidden">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-secondary">
                        {userProfile.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <AlertCircle className="h-5 w-5 text-dark-gray" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Desktop user info */}
                {userProfile && (
                  <div className="hidden lg:flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-secondary">
                        {userProfile.name}
                      </p>
                      <p className="text-xs text-dark-gray">
                        Administrator
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .sidebar::-webkit-scrollbar { width: 6px; }
        .sidebar::-webkit-scrollbar-track { background: #f1f1f1; }
        .sidebar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
        .sidebar::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }
      `}</style>
    </div>
  );
}
