// DashboardLayout.js
import React, { useContext } from "react";
import { Layout, theme, Flex, Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import DashboardNavigation from "./DashboardNavigation";
import DashboardSidebar from "./DashboardSidebar";
import DashboardBreadcrumb from "./DashboardBreadcrumb";
import { SocketContext } from "../context/SocketContext";

const { Content } = Layout;

const DashboardLayout = ({ children }) => {
  const { connecting } = useContext(SocketContext);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <DashboardNavigation />
      <Layout>
        <DashboardSidebar />
        <Layout style={{ padding: "24px" }}>
          <Content>
            <Flex justify={"space-between"}>
              <DashboardBreadcrumb style={{ margin: "16px 0" }} />
              {connecting ? (
              <Spin indicator={<LoadingOutlined spin />} size="middle" style={{ color: "#808080" }} />
              ) : (
              <></>
              )}
            </Flex>
            <div
              style={{
                minHeight: 280,
                padding: "24px 0",
              }}
            >
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
