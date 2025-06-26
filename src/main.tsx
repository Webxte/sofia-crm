
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from "next-themes";
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import ErrorBoundary from './components/ui/ErrorBoundary';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <HelmetProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <AuthProvider>
              <App />
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </HelmetProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
