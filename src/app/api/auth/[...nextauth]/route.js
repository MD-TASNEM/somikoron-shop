import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDb } from "@/lib/db/mongodb";

// Fallback mock database for development
const mockUsers = [
  {
    _id: "1",
    email: "admin@example.com",
    name: "Admin User",
    password: "admin123", // Plain text for demo
    role: "admin",
  },
  {
    _id: "2",
    email: "user@example.com",
    name: "Regular User",
    password: "user123", // Plain text for demo
    role: "user",
  },
];

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Try real database first
          const db = await getDb();
          const userCollection = db.collection("users");
          const user = await userCollection.findOne({
            email: credentials.email,
          });

          if (user && user.password === credentials.password) {
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        } catch (err) {
          console.log("Database not available, using mock data:", err.message);

          // Fallback to mock data
          const mockUser = mockUsers.find(
            (u) =>
              u.email === credentials.email &&
              u.password === credentials.password,
          );

          if (mockUser) {
            return {
              id: mockUser._id,
              email: mockUser.email,
              name: mockUser.name,
              role: mockUser.role,
            };
          }
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
