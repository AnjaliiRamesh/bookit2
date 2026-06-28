// 'use client';

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import api from '../lib/api';

// interface UserPayload {
//   id: string;
//   name: string;
//   email: string;
//   role: 'USER' | 'ORGANIZER'; // Synchronized perfectly with backend DB constraints 
// }

// interface AuthContextType {
//   user: UserPayload | null;
//   token: string | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   signup: (name: string, email: string, password: string, role: 'USER' | 'ORGANIZER') => Promise<void>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<UserPayload | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedToken = localStorage.getItem('token');
//       const storedUser = localStorage.getItem('user');

//       if (storedToken && storedUser) {
//         setToken(storedToken);
//         setUser(JSON.parse(storedUser));
//       }
//       setLoading(false);
//     }
//   }, []);

//   // Transmits email and password configurations down to auth.controller.ts [cite: 44]
//   const login = async (email: string, password: string) => {
//     try {
//       const response = await api.post('/auth/login', { email, password }); // Hits /api/v1/auth/login 
//       const { token: receivedToken, user: receivedUser } = response.data; // Captures issued fields [cite: 50]

//       localStorage.setItem('token', receivedToken);
//       localStorage.setItem('user', JSON.stringify(receivedUser));

//       setToken(receivedToken);
//       setUser(receivedUser);

//       // Automated Role Route Redirection
//       if (receivedUser.role === 'ORGANIZER') {
//         router.push('/organizer/dashboard');
//       } else {
//         router.push('/dashboard');
//       }
//     } catch (error: any) {
//       throw new Error(error.response?.data?.message || 'Invalid registration email or security password.');
//     }
//   };

//   // Transmits registration parameters to handle live PostgreSQL persistence writes [cite: 37, 41]
//   const signup = async (name: string, email: string, password: string, role: 'USER' | 'ORGANIZER') => {
//     try {
//       await api.post('/auth/signup', { name, email, password, role }); // Hits /api/v1/auth/signup 
      
//       // Auto-authenticate upon registration completing successfully
//       const loginResponse = await api.post('/auth/login', { email, password });
//       const { token: receivedToken, user: receivedUser } = loginResponse.data;

//       localStorage.setItem('token', receivedToken);
//       localStorage.setItem('user', JSON.stringify(receivedUser));

//       setToken(receivedToken);
//       setUser(receivedUser);

//       if (receivedUser.role === 'ORGANIZER') {
//         router.push('/organizer/dashboard');
//       } else {
//         router.push('/dashboard');
//       }
//     } catch (error: any) {
//       throw new Error(error.response?.data?.message || 'Platform registration failure.');
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setToken(null);
//     setUser(null);
//     router.push('/');
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must run within an active AuthProvider wrap.');
//   }
//   return context;
// }

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ORGANIZER';
}

interface AuthContextType {
  user: UserPayload | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'USER' | 'ORGANIZER') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Acts as a blocker while cache boots up
  const router = useRouter();

  useEffect(() => {
    const initializeAuthSession = () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      }
      setLoading(false); // Authentication state is fully settled!
    };

    initializeAuthSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      if (receivedUser.role === 'ORGANIZER') {
        router.push('/organizer/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Invalid email or password.');
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'USER' | 'ORGANIZER') => {
    try {
      await api.post('/auth/signup', { name, email, password, role });
      await login(email, password); // Seamless login immediately after signup
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Platform registration failure.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {/* Blocker prevents children from running unauthenticated flashes during page reloads */}
      {loading ? (
        <div className="min-h-screen bg-white flex items-center justify-center font-mono text-xs font-bold text-slate-400 tracking-widest">
          INITIALIZING SECURE SESSION MUX...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must run within an active AuthProvider wrapper.');
  }
  return context;
}