
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import { AuthProvider } from "./context/AuthContext";
import { ContactsProvider } from "./context/ContactsContext";
import { MeetingsProvider } from "./context/MeetingsContext";
import { TasksProvider } from "./context/TasksContext";
import { ProductsProvider } from "./context/ProductsContext";
import { OrdersProvider } from "./context/OrdersContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ContactsProvider>
          <MeetingsProvider>
            <TasksProvider>
              <ProductsProvider>
                <OrdersProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
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
                        
                        {/* Meetings routes */}
                        <Route path="/meetings" element={<Meetings />} />
                        <Route path="/meetings/new" element={<NewMeeting />} />
                        <Route path="/meetings/edit/:id" element={<EditMeeting />} />
                        
                        {/* Tasks routes */}
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/tasks/new" element={<NewTask />} />
                        <Route path="/tasks/edit/:id" element={<EditTask />} />
                        
                        {/* Orders routes */}
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/orders/new" element={<NewOrder />} />
                        <Route path="/orders/edit/:id" element={<EditOrder />} />
                        
                        {/* Calendar route */}
                        <Route path="/calendar" element={<Calendar />} />
                      </Route>

                      {/* Redirect to login for unmatched routes */}
                      <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                  </BrowserRouter>
                </OrdersProvider>
              </ProductsProvider>
            </TasksProvider>
          </MeetingsProvider>
        </ContactsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
