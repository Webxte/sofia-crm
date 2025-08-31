import React, { useEffect, useState } from 'react';
import { Order } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useContacts } from '@/context/contacts/ContactsContext';
import { useOrders } from '@/context/orders/OrdersContext';
import { useProducts } from '@/context/products/ProductsContext';
import { useSettings } from '@/context/settings';
import OrderForm from './OrderForm';
import { OrderFormErrorBoundary } from './OrderFormErrorBoundary';

interface SafeOrderFormProps {
  order?: Order;
  isEditing?: boolean;
  contactId?: string;
}

export const SafeOrderForm = ({ order, isEditing = false, contactId }: SafeOrderFormProps) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const contacts = useContacts();
  const orders = useOrders();
  const products = useProducts();
  const settings = useSettings();

  // Check if all required contexts are loaded and ready
  useEffect(() => {
    const checkContextsReady = () => {
      try {
        // Check if contexts are loaded and have required methods
        const contactsReady = contacts && typeof contacts.getContactById === 'function';
        const ordersReady = orders && typeof orders.addOrder === 'function' && typeof orders.generateOrderReference === 'function';
        const productsReady = products && Array.isArray(products.products);
        const settingsReady = settings && settings.settings !== undefined;

        if (contactsReady && ordersReady && productsReady && settingsReady) {
          setIsReady(true);
          setError(null);
        } else {
          // Give contexts time to initialize
          setTimeout(checkContextsReady, 100);
        }
      } catch (err) {
        console.error('Context initialization error:', err);
        setError('Failed to initialize order form. Please refresh the page.');
      }
    };

    checkContextsReady();
  }, [contacts, orders, products, settings]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner 
          size="lg" 
          message="Loading Order Form" 
          description="Initializing contacts, products, and settings..."
        />
      </div>
    );
  }

  return (
    <OrderFormErrorBoundary>
      <OrderForm order={order} isEditing={isEditing} contactId={contactId} />
    </OrderFormErrorBoundary>
  );
};