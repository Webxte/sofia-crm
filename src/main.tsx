
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { OrganizationsProvider } from './context/organizations/OrganizationsContext';
import App from './App';
import { Toaster } from './components/ui/toaster';
import './index.css';

// Create the root with explicit typing
ReactDOM.createRoot(document.getElementById('root')!).render(
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
