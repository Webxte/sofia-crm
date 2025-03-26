
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { ContactsProvider } from './context/ContactsContext'
import { MeetingsProvider } from './context/MeetingsContext'
import { TasksProvider } from './context/TasksContext'
import { ProductsProvider } from './context/products/ProductsContext'
import { OrdersProvider } from './context/OrdersContext'
import { SettingsProvider } from './context/SettingsContext'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <AuthProvider>
          <ContactsProvider>
            <MeetingsProvider>
              <TasksProvider>
                <ProductsProvider>
                  <OrdersProvider>
                    <SettingsProvider>
                      <App />
                    </SettingsProvider>
                  </OrdersProvider>
                </ProductsProvider>
              </TasksProvider>
            </MeetingsProvider>
          </ContactsProvider>
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>
);
