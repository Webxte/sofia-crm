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
import Products from './pages/Products';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ContactDetails from './pages/contacts/ContactDetails';
import EditContact from './pages/contacts/EditContact';
import NewContact from './pages/contacts/NewContact';
import MeetingDetails from './pages/meetings/MeetingDetails';
import EditMeeting from './pages/meetings/EditMeeting';
import NewMeeting from './pages/meetings/NewMeeting';
import TaskDetails from './pages/tasks/TaskDetails';
import EditTask from './pages/tasks/EditTask';
import NewTask from './pages/tasks/NewTask';
import ProductDetails from './pages/products/ProductDetails';
import EditProduct from './pages/products/EditProduct';
import NewProduct from './pages/products/NewProduct';
import OrderDetails from './pages/orders/OrderDetails';
import EditOrder from './pages/orders/EditOrder';
import NewOrder from './pages/orders/NewOrder';
import { Toaster } from "@/components/ui/toaster"
import { ProtectedRoute } from './components/ProtectedRoute';

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
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                      <Route path="/contacts/:id" element={<ProtectedRoute><ContactDetails /></ProtectedRoute>} />
                      <Route path="/contacts/:id/edit" element={<ProtectedRoute><EditContact /></ProtectedRoute>} />
                      <Route path="/contacts/new" element={<ProtectedRoute><NewContact /></ProtectedRoute>} />
                      <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
                      <Route path="/meetings/:id" element={<ProtectedRoute><MeetingDetails /></ProtectedRoute>} />
                      <Route path="/meetings/:id/edit" element={<ProtectedRoute><EditMeeting /></ProtectedRoute>} />
                      <Route path="/meetings/new" element={<ProtectedRoute><NewMeeting /></ProtectedRoute>} />
                      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                      <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
                      <Route path="/tasks/:id/edit" element={<ProtectedRoute><EditTask /></ProtectedRoute>} />
                      <Route path="/tasks/new" element={<ProtectedRoute><NewTask /></ProtectedRoute>} />
                      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                      <Route path="/products/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
                      <Route path="/products/:id/edit" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
                      <Route path="/products/new" element={<ProtectedRoute><NewProduct /></ProtectedRoute>} />
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
          </ContactsProvider>
        </AuthProvider>
      </BrowserRouter>
  );
}
