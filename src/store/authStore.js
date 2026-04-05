import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";

export const useAuthStore = create(
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

      // Initialize auth state from localStorage
      initializeAuth: () => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token");
          const userStr = localStorage.getItem("user");

          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              set({
                user,
                token,
                isAuthenticated: true,
              });
              return true;
            } catch (error) {
              console.error("Failed to parse stored user:", error);
              // Clear invalid data
              localStorage.removeItem("token");
              localStorage.removeItem("user");
            }
          }
        }
        return false;
      },

      login: async (email, password) => {
        try {
          const response = await api.post("/api/auth/login", {
            email,
            password,
          });
          const { token, user } = response.data;

          set({
            user: {
              uid: user.id,
              email: user.email,
              displayName: user.name,
              photoURL: user.photoURL,
              emailVerified: true,
              role: user.role,
            },
            token,
            isAuthenticated: true,
          });

          // Store in localStorage (browser only)
          if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
          }

          return { user: response.data.user };
        } catch (error) {
          throw new Error(
            error.response?.data?.message || error.message || "Login failed",
          );
        }
      },

      register: async (name, email, password, photoURL) => {
        try {
          const response = await api.post("/api/auth/register", {
            name,
            email,
            password,
            photoURL,
          });
          const { token, user } = response.data;

          set({
            user: {
              uid: user.id,
              email: user.email,
              displayName: user.name,
              photoURL: user.photoURL,
              emailVerified: true,
              role: user.role,
            },
            token,
            isAuthenticated: true,
          });

          // Store in localStorage (browser only)
          if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
          }

          return { user: response.data.user };
        } catch (error) {
          throw new Error(
            error.response?.data?.message ||
              error.message ||
              "Registration failed",
          );
        }
      },

      googleLogin: async () => {
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const user = result.user;

          // Call backend to sync/create user
          const response = await api.post("/api/auth/google", {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
          });

          const { token, user: backendUser } = response.data;

          set({
            user: {
              uid: backendUser.id,
              email: backendUser.email,
              displayName: backendUser.name,
              photoURL: backendUser.photoURL,
              emailVerified: user.emailVerified,
              role: backendUser.role,
            },
            token,
            isAuthenticated: true,
          });

          // Store in localStorage (browser only)
          if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
            localStorage.setItem(
              "user",
              JSON.stringify({
                uid: backendUser.id,
                email: backendUser.email,
                displayName: backendUser.name,
                photoURL: backendUser.photoURL,
                emailVerified: user.emailVerified,
                role: backendUser.role,
              }),
            );
          }

          return { user: backendUser };
        } catch (error) {
          throw new Error(
            error.response?.data?.message ||
              error.message ||
              "Google login failed",
          );
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
        } catch {
          // Silently handle logout errors
        } finally {
          set({ user: null, token: null, isAuthenticated: false });
          // Clear localStorage (browser only)
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
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
          // First check if we have a token in localStorage
          const token =
            typeof window !== "undefined"
              ? localStorage.getItem("token")
              : null;
          const userStr =
            typeof window !== "undefined" ? localStorage.getItem("user") : null;

          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              set({
                user,
                token,
                isAuthenticated: true,
              });
              resolve();
              return;
            } catch (error) {
              console.error("Failed to parse stored user:", error);
            }
          }

          // If no stored data, check Firebase auth state
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
              try {
                // Try to sync with backend
                const response = await api.post("/api/auth/google", {
                  uid: user.uid,
                  email: user.email,
                  name: user.displayName,
                  photoURL: user.photoURL,
                });

                const { token: backendToken, user: backendUser } =
                  response.data;

                set({
                  user: {
                    uid: backendUser.id,
                    email: backendUser.email,
                    displayName: backendUser.name,
                    photoURL: backendUser.photoURL,
                    emailVerified: user.emailVerified,
                    role: backendUser.role,
                  },
                  token: backendToken,
                  isAuthenticated: true,
                });

                // Store in localStorage (browser only)
                if (typeof window !== "undefined") {
                  localStorage.setItem("token", backendToken);
                  localStorage.setItem(
                    "user",
                    JSON.stringify({
                      uid: backendUser.id,
                      email: backendUser.email,
                      displayName: backendUser.name,
                      photoURL: backendUser.photoURL,
                      emailVerified: user.emailVerified,
                      role: backendUser.role,
                    }),
                  );
                }
              } catch (error) {
                console.error("Failed to sync with backend:", error);
                // Set basic Firebase user info as fallback
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
              }
            } else {
              set({ user: null, token: null, isAuthenticated: false });
              // Clear localStorage (browser only)
              if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
              }
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
