// DashboardNavigation.js
import React, { useContext, useEffect, useState } from "react";
import { Layout, Menu, message } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { AuthContext } from "../../Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Title from "antd/es/skeleton/Title";

const { Header } = Layout;

const DashboardNavigation = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    logout();
    setTimeout(() => {
      navigate('/login')
    }, 500)
  };

  const menuItems = [
    {
      key: "1",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "2",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: () => {handleLogout();},
    },
  ];

  return (
    <Header className="header">
      <Menu
        theme="dark"
        mode="horizontal"
        items={menuItems}
        style={{float: 'right'}}
      />
    </Header>
  );
};

export default DashboardNavigation;
