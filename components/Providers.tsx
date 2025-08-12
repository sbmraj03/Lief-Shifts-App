'use client';
import React from 'react';
import { UserProvider } from '@/src/context/UserContext';
import { ApolloProvider } from '@apollo/client';
import client from '@/src/lib/appoloClient';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <UserProvider>{children}</UserProvider>
    </ApolloProvider>
  );
}
