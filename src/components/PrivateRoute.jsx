import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ component: Component }) => {
  return localStorage.getItem('access_token') ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
