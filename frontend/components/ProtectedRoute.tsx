'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'USER' | 'ORGANIZER'; // Matches Prisma schema role constraints perfectly
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // 1. If no active token session exists in local storage cache, redirect to the login gate
      if (!token || !user) {
        router.push('/auth');
        return;
      }

      // 2. Role validation protection guard rule: Evict standard users from organizer suites
      if (allowedRole && user.role !== allowedRole) {
        if (user.role === 'ORGANIZER') {
          router.push('/organizer/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [user, token, loading, router, allowedRole]);

  if (loading || !user || (allowedRole && user.role !== allowedRole)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-mono text-xs text-slate-400 font-bold tracking-wider select-none">
        VERIFYING PLATFORM ROLE CONFIGURATIONS...
      </div>
    );
  }

  return <>{children}</>;
}