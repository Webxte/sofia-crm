
import { Navigate } from "react-router-dom";

export const InitialRedirect = () => {
  return <Navigate to="/dashboard" replace />;
};
