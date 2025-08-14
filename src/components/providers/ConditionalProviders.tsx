
import React, { ReactNode } from 'react';
import { ProductsProvider } from '../../context/products/ProductsContext';
import { SettingsProvider } from '../../context/settings';
import { ContactsProvider } from '../../context/contacts/ContactsContext';
import { MeetingsProvider } from '../../context/meetings';
import { TasksProvider } from '../../context/tasks';
import { OrdersProvider } from '../../context/orders/OrdersContext';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../ui/loading-spinner';

interface ConditionalProvidersProps {
  children: ReactNode;
}

export const ConditionalProviders = ({ children }: ConditionalProvidersProps) => {
  const { isLoading, isAuthenticated } = useAuth();
  console.log("ConditionalProviders: isLoading =", isLoading, "isAuthenticated =", isAuthenticated);

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
    <SettingsProvider>
      <ProductsProvider>
        <ContactsProvider>
          <MeetingsProvider>
            <TasksProvider>
              <OrdersProvider>
                {children}
              </OrdersProvider>
            </TasksProvider>
          </MeetingsProvider>
        </ContactsProvider>
      </ProductsProvider>
    </SettingsProvider>
  );
};
