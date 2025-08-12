
import React, { Suspense, ReactNode } from 'react';
import { AuthWrapper } from '../auth/AuthWrapper';
import SimpleLayout from '../layout/SimpleLayout';
import { LoadingFallback } from '../ui/LoadingFallback';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => (
  <AuthWrapper>
    {children}
  </AuthWrapper>
);


export const ProtectedRouteWithSuspense = ({ children }: ProtectedRouteProps) => (
  <ProtectedRoute>
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  </ProtectedRoute>
);
