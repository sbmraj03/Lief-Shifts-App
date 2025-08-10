'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useUser } from '@/src/context/UserContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // If not authenticated, send user to Auth0 login
      // We use window.location.href because Auth0 login expects a full redirect
      window.location.href = '/api/auth/login';
    }
  }, [loading, user]);

  if (loading || !user) {
    // While loading or redirecting, show a spinner
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}