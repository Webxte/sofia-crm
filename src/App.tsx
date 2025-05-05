
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { OrganizationsProvider } from './context/organizations/OrganizationsContext';
import { ContactsProvider } from './context/contacts/ContactsContext';
import { MeetingsProvider } from './context/meetings';
import { TasksProvider } from './context/TasksContext';
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
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import NotFound from './pages/NotFound';
import Calendar from './pages/Calendar';

export default function App() {
  return (
    <OrganizationsProvider>
      <ContactsProvider>
        <MeetingsProvider>
          <TasksProvider>
            <ProductsProvider>
              <OrdersProvider>
                <SettingsProvider>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Signup />} />
                    <Route path="/organizations/new" element={<NewOrganization />} />
                    <Route path="/" element={<Layout />}>
                      <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                      <Route path="/contacts/:id" element={<ProtectedRoute><ContactDetails /></ProtectedRoute>} />
                      <Route path="/contacts/:id/edit" element={<ProtectedRoute><EditContact /></ProtectedRoute>} />
                      <Route path="/contacts/new" element={<ProtectedRoute><NewContact /></ProtectedRoute>} />
                      <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
                      <Route path="/meetings/:id" element={<ProtectedRoute><MeetingDetails /></ProtectedRoute>} />
                      <Route path="/meetings/:id/edit" element={<ProtectedRoute><EditMeeting /></ProtectedRoute>} />
                      <Route path="/meetings/new" element={<ProtectedRoute><NewMeeting /></ProtectedRoute>} />
                      <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                      <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
                      <Route path="/tasks/:id/edit" element={<ProtectedRoute><EditTask /></ProtectedRoute>} />
                      <Route path="/tasks/new" element={<ProtectedRoute><NewTask /></ProtectedRoute>} />
                      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                      <Route path="/orders/:id/edit" element={<ProtectedRoute><EditOrder /></ProtectedRoute>} />
                      <Route path="/orders/new" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />
                      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute requireAdmin={true}><Settings /></ProtectedRoute>} />
                      <Route path="/organizations/settings" element={<ProtectedRoute><OrganizationSettings /></ProtectedRoute>} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SettingsProvider>
              </OrdersProvider>
            </ProductsProvider>
          </TasksProvider>
        </MeetingsProvider>
      </ContactsProvider>
    </OrganizationsProvider>
  );
}
