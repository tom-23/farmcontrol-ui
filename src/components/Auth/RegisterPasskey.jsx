import React, { useState, useContext, useEffect, useMemo } from "react";
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
} from "antd";
import { LockOutlined } from "@ant-design/icons";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { AuthContext } from "./AuthContext";

import PassKeysIcon from "../Icons/PassKeysIcon"; // Adjust the path if necessary

import "./Auth.css";
import AuthLayout from "./AuthLayout";

const { Title, Text } = Typography;

const RegisterPasskey = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { registerPasskey } = useContext(AuthContext);
  const [init, setInit] = useState(false);

  const handleRegisterPasskey = async (e) => {
    const result = await registerPasskey(email, password);
    if (result.successful === true) {
      setTimeout(() => {
        navigate("/dashboard/overview");
      }, 500);
    } else {}
  };

  return (
    <AuthLayout>
      <Flex vertical="true" align="center" style={{ marginBottom: 25 }}>
        <PassKeysIcon style={{ fontSize: "64px" }} />
        <h1 style={{ marginTop: 10, marginBottom: 10 }}>Register a Passkey</h1>
        <Text style={{ textAlign: "center" }}>
          Please setup a passkey in order to continue. The passkey may use
          another device for encryption.
        </Text>
      </Flex>
      <Button
        type="primary"
        className="auth-form-button"
        icon={<LockOutlined />}
        onClick={() => {
          handleRegisterPasskey();
        }}
      >
        Continue
      </Button>
    </AuthLayout>
  );
};

export default RegisterPasskey;
