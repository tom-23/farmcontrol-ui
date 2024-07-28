import React, { useState, useContext, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Spin,
  Divider,
  Typography,
  Flex,
  Card,
  Space,
  message,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  UserAddOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { AuthContext } from "./AuthContext";
import AuthLayout from "./AuthLayout";

import PassKeysIcon from "../Icons/PassKeysIcon"; // Adjust the path if necessary

import "./Auth.css";

const { Title, Text } = Typography;

const LoginUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authModes, setAuthModes] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginWithPassword, loginWithPasskey, getAuthMode } =
    useContext(AuthContext);

  const handleLogin = async (e) => {
    if (email === "") {
      return;
    }
    if (authModes.length === 0) {
      const result = await getAuthMode(email);
      if (result.successful === true) {
        setAuthModes(result.authModes);
      }
      return;
    }
    var result;
    if (password.length > 0) {
      result = await loginWithPassword(email, password);
    } else {
      result = await loginWithPasskey(email);
    }
    if (result.successful === true) {
      if (authModes.includes("passkey")) {
        setTimeout(() => {
          navigate("/dashboard/overview");
        }, 200);
      } else {
        setTimeout(() => {
          navigate("/login/register-passkey");
        }, 200);
      }
    }
  };

  return (
    <AuthLayout>
      <Flex vertical="true" align="center" style={{ marginBottom: 25 }}>
        <img
          src="/logo512@2x.png"
          style={{ width: "100px" }}
          alt="Farm Control Logo"
        ></img>
        <h1 style={{ marginTop: 10, marginBottom: 10 }}>Farm Control</h1>
        <Text style={{ textAlign: "center" }}>
          Please sign in using your credentials below.
        </Text>
      </Flex>
      <Form
        name="authmode-form"
        className="auth-form"
        initialValues={{ remember: true }}
        onFinish={(e) => {
          handleLogin(e);
        }}
      >
        <Form.Item
          name="email"
          rules={[{ required: true, message: "Please input your Email!" }]}
        >
          <Space.Compact style={{ width: "100%" }}>
            <Input
              autoFocus={true}
              prefix={<UserOutlined className="site-form-item-icon" />} // Use UserOutlined icon
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={authModes.length > 0 ? true : false}
            />
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              htmlType="submit"
              disabled={authModes.length > 0 ? true : false}
            />
          </Space.Compact>
        </Form.Item>
      </Form>
      {authModes.includes("password") ? (
        <Form
          name="auth-form"
          className="auth-form"
          initialValues={{ remember: true }}
          onFinish={(e) => {
            handleLogin(e);
          }}
        >
          <Form.Item
            name="password"
          >
            <Input
              autoFocus={true}
              prefix={<LockOutlined className="site-form-item-icon" />} // Use LockOutlined icon
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Flex style={{ width: "100%" }} gap="middle">
              {authModes.includes("passkey") ? (
                <Button
                  htmlType="submit"
                  icon={<PassKeysIcon />}
                  style={{ flexGrow: 3 }}
                  type="primary"
                >
                  Use Passkey
                </Button>
              ) : (
                <></>
              )}
              <Button
                htmlType="submit"
                icon={<LoginOutlined />}
                style={{ flexGrow: 1 }}
                type={authModes.includes("passkey") ? "" : "primary"}
                disabled={password.length > 0 ? false : true}
              >
                Login
              </Button>
            </Flex>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </Form.Item>
        </Form>
      ) : (
        <></>
      )}

      <Divider plain></Divider>
      <Button className="auth-form-button" icon={<UserAddOutlined />}>
        Register
      </Button>
    </AuthLayout>
  );
};

export default LoginUser;
