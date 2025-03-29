
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ContactsProvider } from './context/ContactsContext';
import { MeetingsProvider } from './context/MeetingsContext';
import { TasksProvider } from './context/TasksContext';
import { ProductsProvider } from './context/products/ProductsContext';
import { OrdersProvider } from './context/OrdersContext';
import { SettingsProvider } from './context/SettingsContext';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Meetings from './pages/Meetings';
import Tasks from './pages/Tasks';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from './components/auth/ProtectedRoute';
import OrderDetails from './pages/orders/OrderDetails';
import EditOrder from './pages/orders/EditOrder';
import NewOrder from './pages/orders/NewOrder';

// Make sure OrdersProvider is properly included in the component hierarchy:
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ContactsProvider>
          <MeetingsProvider>
            <TasksProvider>
              <ProductsProvider>
                <OrdersProvider>
                  <SettingsProvider>
                    <Toaster />
                    <Routes>
                      <Route path="/login" element={<div>Login Page</div>} />
                      <Route path="/register" element={<div>Register Page</div>} />
                      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                      <Route path="/contacts/:id" element={<ProtectedRoute><div>Contact Details</div></ProtectedRoute>} />
                      <Route path="/contacts/:id/edit" element={<ProtectedRoute><div>Edit Contact</div></ProtectedRoute>} />
                      <Route path="/contacts/new" element={<ProtectedRoute><div>New Contact</div></ProtectedRoute>} />
                      <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
                      <Route path="/meetings/:id" element={<ProtectedRoute><div>Meeting Details</div></ProtectedRoute>} />
                      <Route path="/meetings/:id/edit" element={<ProtectedRoute><div>Edit Meeting</div></ProtectedRoute>} />
                      <Route path="/meetings/new" element={<ProtectedRoute><div>New Meeting</div></ProtectedRoute>} />
                      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                      <Route path="/tasks/:id" element={<ProtectedRoute><div>Task Details</div></ProtectedRoute>} />
                      <Route path="/tasks/:id/edit" element={<ProtectedRoute><div>Edit Task</div></ProtectedRoute>} />
                      <Route path="/tasks/new" element={<ProtectedRoute><div>New Task</div></ProtectedRoute>} />
                      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                      <Route path="/orders/:id/edit" element={<ProtectedRoute><EditOrder /></ProtectedRoute>} />
                      <Route path="/orders/new" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    </Routes>
                  </SettingsProvider>
                </OrdersProvider>
              </ProductsProvider>
            </TasksProvider>
          </MeetingsProvider>
        </ContactsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
