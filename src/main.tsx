
// Import React using ESM imports
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { OrganizationsProvider } from './context/organizations/OrganizationsContext';
import { Toaster } from './components/ui/toaster';

console.log("MAIN.TSX - React initialization verification:", {
  reactVersion: React.version,
  useState: typeof React.useState === 'function' ? "Available" : "Not available",
  useEffect: typeof React.useEffect === 'function' ? "Available" : "Not available",
  useCallback: typeof React.useCallback === 'function' ? "Available" : "Not available",
});

// Get the root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found!");
} else {
  try {
    // Create root with error handling
    console.log("Creating root element");
    const root = createRoot(rootElement);
    console.log("Root created successfully");

    // Render the application within error boundaries
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
    console.log("Application rendered successfully");
  } catch (error) {
    console.error("Error rendering application:", error);
  }
}
