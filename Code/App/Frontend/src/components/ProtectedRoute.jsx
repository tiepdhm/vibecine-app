import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['user']);
  const user = cookies.user || { role: 'guest' }; // default to guest

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
