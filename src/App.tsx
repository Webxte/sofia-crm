
import React from 'react';
import { AppRoutes } from './components/routing/AppRoutes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
}
