import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes and their requirements
const protectedRoutes = {
  // Admin routes - require admin role
  admin: {
    path: '/admin',
    requiredRole: 'admin'
  },
  
  // User routes - require any authenticated user
  user: {
    paths: ['/profile', '/orders', '/checkout'],
    requiredRole: 'user'
  }
};

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/products',
  '/contact',
  '/offers',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/error',
  '/api/products',
  '/favicon.ico',
  '/_next/static',
  '/_next/image',
  '/_next/webpack-hmr'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get the token from the request
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // If no token, redirect to login with return URL
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin routes
  if (pathname.startsWith(protectedRoutes.admin.path)) {
    if (token.role !== protectedRoutes.admin.requiredRole) {
      // Redirect to login with error if not admin
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'admin-required');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check user routes
  const isUserRoute = protectedRoutes.user.paths.some(path => 
    pathname.startsWith(path) || pathname === path
  );
  
  if (isUserRoute) {
    if (!token.role || (token.role !== 'user' && token.role !== 'admin')) {
      // Redirect to login if not authenticated user
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If authenticated and has correct role, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
