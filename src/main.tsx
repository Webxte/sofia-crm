
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { OrganizationsProvider } from './context/organizations/OrganizationsContext';
import { Toaster } from "@/components/ui/toaster";

// IMPORTANT: Expose React globally BEFORE any component imports
// This ensures React is available for all modules that might need it
window.React = React;

// Verify React is exposed properly with a console log
console.log("React initialization check:", {
  reactAvailable: !!window.React,
  reactVersion: window.React?.version,
  hooksAvailable: !!window.React?.useState
});

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
            <OrganizationsProvider>
              <App />
              <Toaster />
            </OrganizationsProvider>
          </AuthProvider>
        </HelmetProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
