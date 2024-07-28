// Dashboard.js
import React, { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { useNavigate, Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <DashboardLayout>
        <Outlet />
    </DashboardLayout>
  );
};

export default Dashboard;
