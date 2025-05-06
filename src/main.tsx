import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { OrganizationsProvider } from './context/OrganizationsContext.tsx'; // ✅ ADD THIS
import { Toaster } from "@/components/ui/toaster";

// Get the root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found!");
} else {
  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <HelmetProvider>
          <AuthProvider>
            <OrganizationsProvider> {/* ✅ WRAP App and Toaster inside this */}
              <App />
              <Toaster />
            </OrganizationsProvider>
          </AuthProvider>
        </HelmetProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
