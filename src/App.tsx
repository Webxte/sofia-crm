
import React from 'react';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { AppProviders } from './components/providers/AppProviders';
import { AppRoutes } from './components/routing/AppRoutes';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </ErrorBoundary>
  );
}
