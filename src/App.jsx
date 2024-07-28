import React, { useContext, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { App, ConfigProvider, theme } from "antd";
import LoginUser from "./components/Auth/LoginUser.jsx";
import RegisterPasskey from "./components/Auth/RegisterPasskey.jsx";
import Profile from "./components/Dashboard/Profile.jsx";
import Overview from "./components/Dashboard/Overview";

import Printers from "./components/Dashboard/Printers/Printers";
import EditPrinter from "./components/Dashboard/Printers/EditPrinter.jsx";
import ControlPrinter from "./components/Dashboard/Printers/ControlPrinter.jsx";

import PrintJobs from "./components/Dashboard/PrintJobs/PrintJobs.jsx";

import Fillaments from "./components/Dashboard/Fillaments/Fillaments.jsx";

import GCodeFiles from "./components/Dashboard/GCodeFiles/GCodeFiles.jsx";

import Dashboard from "./components/Dashboard/common/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute.jsx";
import "./App.css";
import { SocketProvider } from "./components/Dashboard/context/SocketContext.js";
import { AuthProvider } from "./components/Auth/AuthContext.js";

const FarmControlApp = () => {
  return (
    <ConfigProvider
      theme={{
        // 1. Use dark algorithm
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: '#191919',
          colorPrimary: '#0A84FF',
          colorSuccess: '#32D74B',
          colorWarning: '#FF9F0A',
          colorInfo: '#0A84FF',
          colorLink: '#5AC8F5',
          borderRadius: '10px',
        },
        // 2. Combine dark algorithm and compact algorithm
        // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      }}
    >
      <App>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <Routes>
                <Route
                  path="login"
                  element={<PublicRoute component={() => <LoginUser />} />}
                />

                <Route
                  path="login/register-passkey"
                  element={
                    <PrivateRoute component={() => <RegisterPasskey />} />
                  }
                />

                <Route
                  path="/dashboard"
                  element={<PrivateRoute component={() => <Dashboard />} />}
                >
                  <Route path="profile" element={<Profile />} />
                  <Route path="overview" element={<Overview />} />
                  <Route path="printers" element={<Printers />} />
                  <Route path="printers/edit" element={<EditPrinter />} />
                  <Route path="printers/control" element={<ControlPrinter />} />
                  <Route path="printjobs" element={<PrintJobs />} />
                  <Route path="fillaments" element={<Fillaments />} />
                  <Route path="gcodefiles" element={<GCodeFiles />} />
                </Route>
              </Routes>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </App>
    </ConfigProvider>
  );
};

export default FarmControlApp;
