import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ component: Component }) => {
  return !localStorage.getItem('access_token') ? <Component /> : <Navigate to="/dashboard/overview" />;
};

export default PublicRoute;
