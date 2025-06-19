
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthWrapper } from '../auth/AuthWrapper';
import { InitialRedirect } from '../auth/InitialRedirect';
import { LoadingFallback } from '../ui/LoadingFallback';
import { ProtectedRouteWithSuspense } from './ProtectedRoute';
import Login from '../../pages/auth/Login';
import Signup from '../../pages/auth/Signup';
import NotFound from '../../pages/NotFound';
import {
  Dashboard,
  Contacts,
  ContactDetails,
  EditContact,
  NewContact,
  Meetings,
  MeetingDetails,
  EditMeeting,
  NewMeeting,
  Tasks,
  TaskDetails,
  EditTask,
  NewTask,
  Orders,
  OrderDetails,
  EditOrder,
  NewOrder,
  Settings,
  Reports,
  Calendar
} from './LazyComponents';

export const AppRoutes = () => (
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
    <Route path="/dashboard" element={<ProtectedRouteWithSuspense><Dashboard /></ProtectedRouteWithSuspense>}>
      <Route index element={
        <Suspense fallback={<LoadingFallback />}>
          <Dashboard />
        </Suspense>
      } />
    </Route>

    <Route path="/contacts" element={<ProtectedRouteWithSuspense><Contacts /></ProtectedRouteWithSuspense>}>
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

    <Route path="/meetings" element={<ProtectedRouteWithSuspense><Meetings /></ProtectedRouteWithSuspense>}>
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

    <Route path="/calendar" element={<ProtectedRouteWithSuspense><Calendar /></ProtectedRouteWithSuspense>}>
      <Route index element={
        <Suspense fallback={<LoadingFallback />}>
          <Calendar />
        </Suspense>
      } />
    </Route>

    <Route path="/tasks" element={<ProtectedRouteWithSuspense><Tasks /></ProtectedRouteWithSuspense>}>
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

    <Route path="/orders" element={<ProtectedRouteWithSuspense><Orders /></ProtectedRouteWithSuspense>}>
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

    <Route path="/reports" element={<ProtectedRouteWithSuspense><Reports /></ProtectedRouteWithSuspense>}>
      <Route index element={
        <Suspense fallback={<LoadingFallback />}>
          <Reports />
        </Suspense>
      } />
    </Route>

    <Route path="/settings" element={<ProtectedRouteWithSuspense><Settings /></ProtectedRouteWithSuspense>}>
      <Route index element={
        <Suspense fallback={<LoadingFallback />}>
          <Settings />
        </Suspense>
      } />
    </Route>
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);
