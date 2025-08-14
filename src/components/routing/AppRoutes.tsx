
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ConditionalProviders } from "../providers/ConditionalProviders";
import { LoadingFallback } from "../ui/LoadingFallback";
import Layout from "../layout/Layout";
import ProtectedRoute from "../auth/ProtectedRoute";

// Lazy load components
import Index from "@/pages/Index";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import Dashboard from "@/pages/Dashboard";
import Contacts from "@/pages/Contacts";
import ContactDetails from "@/pages/ContactDetails";
import NewContact from "@/pages/contacts/NewContact";
import EditContact from "@/pages/contacts/EditContact";
import Meetings from "@/pages/Meetings";
import MeetingDetails from "@/pages/MeetingDetails";
import NewMeeting from "@/pages/meetings/NewMeeting";
import EditMeeting from "@/pages/meetings/EditMeeting";
import Tasks from "@/pages/Tasks";
import TaskDetails from "@/pages/TaskDetails";
import NewTask from "@/pages/tasks/NewTask";
import EditTask from "@/pages/tasks/EditTask";
import Orders from "@/pages/Orders";
import NewOrder from "@/pages/orders/NewOrder";
import EditOrder from "@/pages/orders/EditOrder";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Calendar from "@/pages/Calendar";
import NotFound from "@/pages/NotFound";
import OrderDetails from "@/pages/orders/OrderDetails";

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <ConditionalProviders>
                <Layout />
              </ConditionalProviders>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="contacts/new" element={<NewContact />} />
          <Route path="contacts/:id" element={<ContactDetails />} />
          <Route path="contacts/:id/edit" element={<EditContact />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="meetings/new" element={<NewMeeting />} />
          <Route path="meetings/:id" element={<MeetingDetails />} />
          <Route path="meetings/:id/edit" element={<EditMeeting />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/new" element={<NewTask />} />
          <Route path="tasks/:id" element={<TaskDetails />} />
          <Route path="tasks/:id/edit" element={<EditTask />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<NewOrder />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="orders/:id/edit" element={<EditOrder />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
