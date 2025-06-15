
import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ContactsProvider } from './context/contacts/ContactsContext';
import { MeetingsProvider } from './context/meetings';
import { TasksProvider } from './context/tasks';
import { ProductsProvider } from './context/products/ProductsContext';
import { OrdersProvider } from './context/orders/OrdersContext';
import { SettingsProvider } from './context/settings';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SimpleLayout from './components/layout/SimpleLayout';
import { LoadingSpinner } from './components/ui/loading-spinner';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Index from './pages/Index';
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

// Separate component to ensure proper context nesting
const AppProviders = ({ children }: { children: React.ReactNode }) => (
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
);

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Root index route - decides where to navigate */}
        <Route index element={<Index />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        
        {/* Protected routes - wrapped in SimpleLayout */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppProviders>
              <SimpleLayout />
            </AppProviders>
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={
            <Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="/contacts" element={
            <Suspense fallback={<LoadingFallback />}>
              <Contacts />
            </Suspense>
          } />
          <Route path="/contacts/:id" element={
            <Suspense fallback={<LoadingFallback />}>
              <ContactDetails />
            </Suspense>
          } />
          <Route path="/contacts/:id/edit" element={
            <Suspense fallback={<LoadingFallback />}>
              <EditContact />
            </Suspense>
          } />
          <Route path="/contacts/new" element={
            <Suspense fallback={<LoadingFallback />}>
              <NewContact />
            </Suspense>
          } />
          <Route path="/meetings" element={
            <Suspense fallback={<LoadingFallback />}>
              <Meetings />
            </Suspense>
          } />
          <Route path="/meetings/:id" element={
            <Suspense fallback={<LoadingFallback />}>
              <MeetingDetails />
            </Suspense>
          } />
          <Route path="/meetings/:id/edit" element={
            <Suspense fallback={<LoadingFallback />}>
              <EditMeeting />
            </Suspense>
          } />
          <Route path="/meetings/new" element={
            <Suspense fallback={<LoadingFallback />}>
              <NewMeeting />
            </Suspense>
          } />
          <Route path="/calendar" element={
            <Suspense fallback={<LoadingFallback />}>
              <Calendar />
            </Suspense>
          } />
          <Route path="/tasks" element={
            <Suspense fallback={<LoadingFallback />}>
              <Tasks />
            </Suspense>
          } />
          <Route path="/tasks/:id" element={
            <Suspense fallback={<LoadingFallback />}>
              <TaskDetails />
            </Suspense>
          } />
          <Route path="/tasks/:id/edit" element={
            <Suspense fallback={<LoadingFallback />}>
              <EditTask />
            </Suspense>
          } />
          <Route path="/tasks/new" element={
            <Suspense fallback={<LoadingFallback />}>
              <NewTask />
            </Suspense>
          } />
          <Route path="/orders" element={
            <Suspense fallback={<LoadingFallback />}>
              <Orders />
            </Suspense>
          } />
          <Route path="/orders/:id" element={
            <Suspense fallback={<LoadingFallback />}>
              <OrderDetails />
            </Suspense>
          } />
          <Route path="/orders/:id/edit" element={
            <Suspense fallback={<LoadingFallback />}>
              <EditOrder />
            </Suspense>
          } />
          <Route path="/orders/new" element={
            <Suspense fallback={<LoadingFallback />}>
              <NewOrder />
            </Suspense>
          } />
          <Route path="/reports" element={
            <Suspense fallback={<LoadingFallback />}>
              <Reports />
            </Suspense>
          } />
          <Route path="/settings" element={
            <Suspense fallback={<LoadingFallback />}>
              <Settings />
            </Suspense>
          } />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
