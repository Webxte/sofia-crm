
import React, { ReactNode } from 'react';
import { DirectProductsProvider } from '../../context/products/DirectProductsProvider';
import { DirectSettingsProvider } from '../../context/settings/DirectSettingsProvider';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../ui/loading-spinner';

interface ConditionalProvidersProps {
  children: ReactNode;
}

export const ConditionalProviders = ({ children }: ConditionalProvidersProps) => {
  const { isLoading } = useAuth();

  // Show loading while auth initializes
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <LoadingSpinner 
          size="lg" 
          message="Loading Your CRM" 
          description="Please wait while we set up your workspace..."
        />
      </div>
    );
  }

  return (
    <DirectSettingsProvider>
      <DirectProductsProvider>
        {children}
      </DirectProductsProvider>
    </DirectSettingsProvider>
  );
};
