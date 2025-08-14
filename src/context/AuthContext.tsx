import * as React from "react";

// Temporary minimal AuthContext to avoid React module issues
export const useAuth = () => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  login: async (email: string, password: string) => {},
  createUser: async (name: string, email: string, password: string, role: "admin" | "agent") => {},
  logout: async () => {},
});

// Temporary minimal AuthProvider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};