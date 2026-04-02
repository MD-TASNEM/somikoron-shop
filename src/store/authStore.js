import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        const response = await axios.post('/api/auth/login', { email, password });
        set({ 
          user: response.data.user, 
          token: response.data.token, 
          isAuthenticated: true 
        });
        return response.data;
      },
      
      register: async (name, email, password, photoURL) => {
        const response = await axios.post('/api/auth/register', { name, email, password, photoURL });
        set({ 
          user: response.data.user, 
          token: response.data.token, 
          isAuthenticated: true 
        });
        return response.data;
      },
      
      googleLogin: async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Send to backend to get JWT
        const response = await axios.post('/api/auth/google', {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL
        });
        
        set({ 
          user: response.data.user, 
          token: response.data.token, 
          isAuthenticated: true 
        });
        return response.data;
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      checkAuth: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ user: response.data.user, isAuthenticated: true });
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
        }
      }
    }),
    {
      name: 'somikoron-auth',
    }
  )
);
