// Sidebar.js
import React from "react";
import { Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  PrinterOutlined,
  PlayCircleOutlined,
  FileOutlined,
} from "@ant-design/icons";

import FillamentIcon from "../../Icons/FillamentIcon"
import GCodeFileIcon from "../../Icons/GCodeFileIcon";

const { Sider } = Layout;

const Sidebar = () => {
  const items = [
    {
      key: "overview",
      label: <Link to="/dashboard/overview">Overview</Link>,
      icon: <DashboardOutlined />,
    },
    {
      key: "printers",
      label: <Link to="/dashboard/printers">Printers</Link>,
      icon: <PrinterOutlined />,
    },
    {
      key: "jobs",
      label: <Link to="/dashboard/printjobs">Print Jobs</Link>,
      icon: <PlayCircleOutlined />,
    },
    {
      key: "fillaments",
      label: <Link to="/dashboard/fillaments">Fillaments</Link>,
      icon: <FillamentIcon />,
    },
    {
      key: "gcodefiles",
      label: <Link to="/dashboard/gcodefiles">G Code Files</Link>,
      icon: <GCodeFileIcon />,
    },
  ];
  return (
    <Sider width={250} className="site-layout-background" collapsible>
      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        style={{ height: "100%", borderRight: 0 }}
        items={items}
      />
    </Sider>
  );
};

export default Sidebar;
