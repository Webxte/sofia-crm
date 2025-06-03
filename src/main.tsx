
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { OrganizationsProvider } from './context/organizations/OrganizationsContext';
import App from './App';
import { Toaster } from './components/ui/sonner';
import './index.css';

// Create the root with explicit typing and ensure we're using a properly existing element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Create the root with explicit typing
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <AuthProvider>
          <OrganizationsProvider>
            <App />
            <Toaster />
          </OrganizationsProvider>
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
