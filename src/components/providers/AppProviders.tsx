
import React, { ReactNode } from 'react';
import { ThemeProvider } from "next-themes";
import ErrorBoundary from '../ui/ErrorBoundary';
import { ContactsProvider } from '../../context/contacts/ContactsContext';
import { MeetingsProvider } from '../../context/meetings';
import { TasksProvider } from '../../context/tasks';
import { ProductsProvider } from '../../context/products/ProductsContext';
import { OrdersProvider } from '../../context/orders/OrdersContext';
import { SettingsProvider } from '../../context/settings';
import { Toaster } from '../ui/sonner';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ErrorBoundary>
        <SettingsProvider>
          <ContactsProvider>
            <MeetingsProvider>
              <TasksProvider>
                <ProductsProvider>
                  <OrdersProvider>
                    {children}
                  </OrdersProvider>
                </ProductsProvider>
              </TasksProvider>
            </MeetingsProvider>
          </ContactsProvider>
        </SettingsProvider>
      </ErrorBoundary>
      {/* Move Toaster outside the nested providers but inside ThemeProvider */}
      <Toaster />
    </ThemeProvider>
  </ErrorBoundary>
);
