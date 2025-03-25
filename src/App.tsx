
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import NewContact from "./pages/contacts/NewContact";
import EditContact from "./pages/contacts/EditContact";
import Meetings from "./pages/Meetings";
import NewMeeting from "./pages/meetings/NewMeeting";
import EditMeeting from "./pages/meetings/EditMeeting";
import Tasks from "./pages/Tasks";
import NewTask from "./pages/tasks/NewTask";
import EditTask from "./pages/tasks/EditTask";
import Orders from "./pages/Orders";
import NewOrder from "./pages/orders/NewOrder";
import EditOrder from "./pages/orders/EditOrder";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes */}
        <Route 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          
          {/* Contacts routes */}
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/contacts/new" element={<NewContact />} />
          <Route path="/contacts/edit/:id" element={<EditContact />} />
          <Route path="/contacts/:id" element={<Navigate to="/contacts/edit/:id" replace />} />
          
          {/* Meetings routes */}
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/meetings/new" element={<NewMeeting />} />
          <Route path="/meetings/edit/:id" element={<EditMeeting />} />
          <Route path="/meetings/:id" element={<Navigate to="/meetings/edit/:id" replace />} />
          
          {/* Tasks routes */}
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/new" element={<NewTask />} />
          <Route path="/tasks/edit/:id" element={<EditTask />} />
          <Route path="/tasks/:id" element={<Navigate to="/tasks/edit/:id" replace />} />
          
          {/* Orders routes */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<NewOrder />} />
          <Route path="/orders/edit/:id" element={<EditOrder />} />
          <Route path="/orders/:id" element={<Navigate to="/orders/edit/:id" replace />} />
          
          {/* Calendar route */}
          <Route path="/calendar" element={<Calendar />} />
          
          {/* User routes */}
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin routes */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={
            <ProtectedRoute requireAdmin>
              <Settings />
            </ProtectedRoute>
          } />
        </Route>

        {/* NotFound route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
