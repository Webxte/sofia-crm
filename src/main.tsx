
// Explicitly import the full React library and all hooks we might need
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { OrganizationsProvider } from './context/organizations/OrganizationsContext';
import { Toaster } from "@/components/ui/toaster";

// CRITICAL: First, ensure React is globally available BEFORE any component imports or rendering
// Explicitly expose React and its hooks to the window object
window.React = React;

// Add detailed logging to verify React is properly initialized
console.log("MAIN.TSX - React initialization verification:", {
  reactObject: window.React ? "Available" : "Not available",
  reactVersion: window.React?.version,
  useState: typeof window.React?.useState === 'function' ? "Available" : "Not available",
  useEffect: typeof window.React?.useEffect === 'function' ? "Available" : "Not available",
  useCallback: typeof window.React?.useCallback === 'function' ? "Available" : "Not available"
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

    // Add explicit error boundary around the entire application
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
