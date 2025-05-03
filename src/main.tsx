
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'

// Get the root element
const rootElement = document.getElementById("root");

// Ensure the root element exists before attempting to render
if (!rootElement) {
  console.error("Root element not found!");
} else {
  createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
