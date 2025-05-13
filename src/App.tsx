
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ContactsProvider } from './context/contacts/ContactsContext';
import { MeetingsProvider } from './context/meetings';
import { TasksProvider } from './context/tasks';
import { ProductsProvider } from './context/products/ProductsContext';
import { OrdersProvider } from './context/OrdersContext';
import { SettingsProvider } from './context/SettingsContext';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import ContactDetails from './pages/ContactDetails';
import EditContact from './pages/contacts/EditContact';
import NewContact from './pages/contacts/NewContact';
import Meetings from './pages/Meetings';
import MeetingDetails from './pages/MeetingDetails';
import EditMeeting from './pages/meetings/EditMeeting';
import NewMeeting from './pages/meetings/NewMeeting';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import EditTask from './pages/tasks/EditTask';
import NewTask from './pages/tasks/NewTask';
import Orders from './pages/Orders';
import OrderDetails from './pages/orders/OrderDetails';
import EditOrder from './pages/orders/EditOrder';
import NewOrder from './pages/orders/NewOrder';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import OrganizationSettings from './pages/organizations/OrganizationSettings';
import NewOrganization from './pages/organizations/NewOrganization';
import OrganizationLogin from './pages/organizations/OrganizationLogin';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import NotFound from './pages/NotFound';
import Calendar from './pages/Calendar';
import Index from './pages/Index';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Root index route - decides where to navigate */}
        <Route index element={<Index />} />

        {/* Auth routes - these don't need the other providers */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/organizations/new" element={<NewOrganization />} />
        <Route path="/organizations/login" element={<OrganizationLogin />} />
        
        {/* Protected routes - these need all providers and are wrapped in Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <ContactsProvider>
              <MeetingsProvider>
                <TasksProvider>
                  <ProductsProvider>
                    <OrdersProvider>
                      <SettingsProvider>
                        <Layout />
                      </SettingsProvider>
                    </OrdersProvider>
                  </ProductsProvider>
                </TasksProvider>
              </MeetingsProvider>
            </ContactsProvider>
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/contacts/:id" element={<ContactDetails />} />
          <Route path="/contacts/:id/edit" element={<EditContact />} />
          <Route path="/contacts/new" element={<NewContact />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/meetings/:id" element={<MeetingDetails />} />
          <Route path="/meetings/:id/edit" element={<EditMeeting />} />
          <Route path="/meetings/new" element={<NewMeeting />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/tasks/:id/edit" element={<EditTask />} />
          <Route path="/tasks/new" element={<NewTask />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/orders/:id/edit" element={<EditOrder />} />
          <Route path="/orders/new" element={<NewOrder />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<ProtectedRoute requireAdmin={true}><Settings /></ProtectedRoute>} />
          <Route path="/organizations/settings" element={<OrganizationSettings />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
