import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProductContext, hasPermission, hasPageAccess, ROLES } from '../context/ProductContext';

/**
 * ProtectedRoute - Component to protect routes based on user roles and page access
 * @param {React.ReactNode} children - Child components to render
 * @param {string} requiredRole - The minimum role required to access the route
 * @param {boolean} requireAuth - Whether authentication is required
 * @param {string} pageName - The page name for page-level access control (optional)
 */
const ProtectedRoute = ({ children, requiredRole = ROLES.USER, requireAuth = true, pageName }) => {
  const { user } = useProductContext();
  const location = useLocation();

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in but doesn't have required permission
  if (user && !hasPermission(user, requiredRole)) {
    // Redirect to home if user doesn't have permission
    return <Navigate to="/" replace />;
  }

  // Check page-specific access if pageName is provided
  if (user && pageName && !hasPageAccess(user, pageName)) {
    // User doesn't have access to this specific page
    // Redirect to dashboard if they have one, otherwise to home
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
