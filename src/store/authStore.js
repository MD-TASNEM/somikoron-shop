import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Admin email list - in production, this should come from a database
      adminEmails: [
        "admin@somikoron.com",
        "tasnem@example.com",
        "test@admin.com",
        "hujaifa@admin.com",
        // Add other admin emails here
      ],

      login: async (email, password) => {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password,
          );
          const user = userCredential.user;

          // Check if user is admin
          const isAdmin = get().adminEmails.includes(email);

          set({
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified,
              role: isAdmin ? "admin" : "user",
            },
            token: await user.getIdToken(),
            isAuthenticated: true,
          });

          return { user: userCredential.user };
        } catch (error) {
          throw new Error(error.message);
        }
      },

      register: async (name, email, password, photoURL) => {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password,
          );
          const user = userCredential.user;

          // Check if user is admin
          const isAdmin = get().adminEmails.includes(email);

          set({
            user: {
              uid: user.uid,
              email: user.email,
              displayName: name,
              photoURL: photoURL || user.photoURL,
              emailVerified: user.emailVerified,
              role: isAdmin ? "admin" : "user",
            },
            token: await user.getIdToken(),
            isAuthenticated: true,
          });

          return { user: userCredential.user };
        } catch (error) {
          throw new Error(error.message);
        }
      },

      googleLogin: async () => {
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const user = result.user;

          // Check if user is admin
          const isAdmin = get().adminEmails.includes(user.email);

          set({
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified,
              role: isAdmin ? "admin" : "user",
            },
            token: await user.getIdToken(),
            isAuthenticated: true,
          });

          return { user: result.user };
        } catch (error) {
          throw new Error(error.message);
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
        } catch {
          // Silently handle logout errors
        } finally {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      forgotPassword: async (email) => {
        try {
          await sendPasswordResetEmail(auth, email);
        } catch (error) {
          throw new Error(error.message);
        }
      },

      checkAuth: () => {
        return new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
              const token = await user.getIdToken();
              // Check if user is admin
              const isAdmin = get().adminEmails.includes(user.email);

              set({
                user: {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                  emailVerified: user.emailVerified,
                  role: isAdmin ? "admin" : "user",
                },
                token,
                isAuthenticated: true,
              });
            } else {
              set({ user: null, token: null, isAuthenticated: false });
            }
            unsubscribe();
            resolve();
          });
        });
      },
    }),
    {
      name: "somikoron-auth",
    },
  ),
);
