import React, { useContext } from "react";
import { Spin, Flex, Card } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { AuthContext } from "./AuthContext";
import AuthParticles from "./AuthParticles";
import "./Auth.css";

const AuthLayout = ({ children }) => {
  const { loading } = useContext(AuthContext);
  return (
    <>
      <AuthParticles />
      <Flex
        horizontal="true"
        align="center"
        justify="center"
        style={{ paddingTop: "35px" }}
      >
        <Card style={{ maxWidth: 350 }}>
          <Spin spinning={loading} indicator={<LoadingOutlined spin />} size="large">
            {children}
          </Spin>
        </Card>
      </Flex>
    </>
  );
};

export default AuthLayout;
