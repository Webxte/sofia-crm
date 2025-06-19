
import React, { Suspense, ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "next-themes";
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ContactsProvider } from './context/contacts/ContactsContext';
import { MeetingsProvider } from './context/meetings';
import { TasksProvider } from './context/tasks';
import { ProductsProvider } from './context/products/ProductsContext';
import { OrdersProvider } from './context/orders/OrdersContext';
import { SettingsProvider } from './context/settings';
import { AuthWrapper } from './components/auth/AuthWrapper';
import { InitialRedirect } from './components/auth/InitialRedirect';
import SimpleLayout from './components/layout/SimpleLayout';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { Toaster } from './components/ui/sonner';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import NotFound from './pages/NotFound';

// Lazy load main pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Contacts = React.lazy(() => import('./pages/Contacts'));
const ContactDetails = React.lazy(() => import('./pages/ContactDetails'));
const EditContact = React.lazy(() => import('./pages/contacts/EditContact'));
const NewContact = React.lazy(() => import('./pages/contacts/NewContact'));
const Meetings = React.lazy(() => import('./pages/Meetings'));
const MeetingDetails = React.lazy(() => import('./pages/MeetingDetails'));
const EditMeeting = React.lazy(() => import('./pages/meetings/EditMeeting'));
const NewMeeting = React.lazy(() => import('./pages/meetings/NewMeeting'));
const Tasks = React.lazy(() => import('./pages/Tasks'));
const TaskDetails = React.lazy(() => import('./pages/TaskDetails'));
const EditTask = React.lazy(() => import('./pages/tasks/EditTask'));
const NewTask = React.lazy(() => import('./pages/tasks/NewTask'));
const Orders = React.lazy(() => import('./pages/Orders'));
const OrderDetails = React.lazy(() => import('./pages/orders/OrderDetails'));
const EditOrder = React.lazy(() => import('./pages/orders/EditOrder'));
const NewOrder = React.lazy(() => import('./pages/orders/NewOrder'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Calendar = React.lazy(() => import('./pages/Calendar'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" message="Loading..." />
  </div>
);

// Separate component to ensure proper context nesting with error boundaries
const AppProviders = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ErrorBoundary>
        <SettingsProvider>
          <ContactsProvider>
            <MeetingsProvider>
              <TasksProvider>
                <ProductsProvider>
                  <OrdersProvider>
                    {children}
                  </OrdersProvider>
                </ProductsProvider>
              </TasksProvider>
            </MeetingsProvider>
          </ContactsProvider>
        </SettingsProvider>
      </ErrorBoundary>
      {/* Move Toaster outside the nested providers but inside ThemeProvider */}
      <Toaster />
    </ThemeProvider>
  </ErrorBoundary>
);

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Routes>
          {/* Auth routes - these don't require AuthWrapper */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          
          {/* Root route that redirects to dashboard */}
          <Route path="/" element={
            <AuthWrapper>
              <InitialRedirect />
            </AuthWrapper>
          } />
          
          {/* Protected routes - wrapped in AuthWrapper and layout */}
          <Route path="/dashboard" element={
            <AuthWrapper>
              <SimpleLayout />
            </AuthWrapper>
          }>
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard />
              </Suspense>
            } />
          </Route>

          <Route path="/contacts" element={
            <AuthWrapper>
              <SimpleLayout />
            </AuthWrapper>
          }>
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <Contacts />
              </Suspense>
            } />
            <Route path=":id" element={
              <Suspense fallback={<LoadingFallback />}>
                <ContactDetails />
              </Suspense>
            } />
            <Route path=":id/edit" element={
              <Suspense fallback={<LoadingFallback />}>
                <EditContact />
              </Suspense>
            } />
            <Route path="new" element={
              <Suspense fallback={<LoadingFallback />}>
                <NewContact />
              </Suspense>
            } />
          </Route>

          <Route path="/meetings" element={
            <AuthWrapper>
              <SimpleLayout />
            </AuthWrapper>
          }>
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <Meetings />
              </Suspense>
            } />
            <Route path=":id" element={
              <Suspense fallback={<LoadingFallback />}>
                <MeetingDetails />
              </Suspense>
            } />
            <Route path=":id/edit" element={
              <Suspense fallback={<LoadingFallback />}>
                <EditMeeting />
              </Suspense>
            } />
            <Route path="new" element={
              <Suspense fallback={<LoadingFallback />}>
                <NewMeeting />
              </Suspense>
            } />
          </Route>

          <Route path="/calendar" element={
            <AuthWrapper>
              <SimpleLayout />
            </AuthWrapper>
          }>
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <Calendar />
              </Suspense>
            } />
          </Route>

          <Route path="/tasks" element={
            <AuthWrapper>
              <SimpleLayout />
            </AuthWrapper>
          }>
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <Tasks />
              </Suspense>
            } />
            <Route path=":id" element={
              <Suspense fallback={<LoadingFallback />}>
                <TaskDetails />
              </Suspense>
            } />
            <Route path=":id/edit" element={
              <Suspense fallback={<LoadingFallback />}>
                <EditTask />
              </Suspense>
            } />
            <Route path="new" element={
              <Suspense fallback={<LoadingFallback />}>
                <NewTask />
              </Suspense>
            } />
          </Route>

          <Route path="/orders" element={
            <AuthWrapper>
              <SimpleLayout />
            </AuthWrapper>
          }>
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <Orders />
              </Suspense>
            } />
            <Route path=":id" element={
              <Suspense fallback={<LoadingFallback />}>
                <OrderDetails />
              </Suspense>
            } />
            <Route path=":id/edit" element={
              <Suspense fallback={<LoadingFallback />}>
                <EditOrder />
              </Suspense>
            } />
            <Route path="new" element={
              <Suspense fallback={<LoadingFallback />}>
                <NewOrder />
              </Suspense>
            } />
          </Route>

          <Route path="/reports" element={
            <AuthWrapper>
              <SimpleLayout />
            </AuthWrapper>
          }>
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <Reports />
              </Suspense>
            } />
          </Route>

          <Route path="/settings" element={
            <AuthWrapper>
              <SimpleLayout />
            </AuthWrapper>
          }>
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <Settings />
              </Suspense>
            } />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppProviders>
    </ErrorBoundary>
  );
}
