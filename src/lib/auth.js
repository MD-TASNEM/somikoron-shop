import { getToken } from 'next-auth/jwt';

export async function getSessionUser(request) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token || !token.sub) return null;
    return {
      id: token.sub,
      email: token.email,
      name: token.name,
      role: token.role || 'user',
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(request) {
  const user = await getSessionUser(request);
  if (!user || user.role !== 'admin') return null;
  return user;
}
