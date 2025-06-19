
import React from 'react';
import { LoadingSpinner } from './loading-spinner';

export const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" message="Loading..." />
  </div>
);
