'use client';
import React from 'react';
import { UserProvider } from '@/src/context/UserContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}