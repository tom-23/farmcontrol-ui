// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { message } from "antd";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [token, setToken] = useState(
    localStorage.getItem("access_token") || null
  );
  const [loading, setLoading] = useState(false);

  const validateToken = useCallback(async (token) => {
    if (!token) {
      return false;
    }
    setLoading(true);
    try {
      const reponse = await axios.post(
        "http://localhost:8080/auth/validate-token",
        {
          token,
        }
      );
      if (reponse.data.status === "OK") {
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error("Invalid token", error);
      messageApi.error("Session invalid.");
      setToken(null);
      localStorage.removeItem("access_token");
    }
    setLoading(false);
    return false;
  }, [messageApi]);

  const getAuthMode = useCallback(async (email) => {
    if (!email) {
      return { successful: false };
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/auth/modes", {
        email,
      });
      const { authModes } = response.data;
      setLoading(false);
      return { successful: true, authModes };
    } catch (error) {
      if (error.response === undefined) {
        messageApi.error(
          "An error occoured obtaining the auth mode: " + error.message
        );
      } else {
        if (error.response.status === 400) {
          messageApi.error(error.response.data.error);
        } else {
          messageApi.error(
            "An unexpected error occoured obtaining the auth mode. (" +
              error.response.status +
              ")"
          );
        }
      }
    }
    setLoading(false);
    return { successful: false };
  }, [messageApi]);

  const handleLoginFinished = (user, access_token) => {
    setToken(access_token);
    localStorage.setItem("access_token", access_token);
    messageApi.info("Welcome, " + user.name + ".");
    return { successful: true, hasPasskey: user.hasPasskey };
  };

  const loginWithPassword = useCallback(async (email, password) => {
    if (!email || !password) {
      return { successful: false };
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        email,
        password,
      });
      const { user, access_token } = response.data;
      return handleLoginFinished(user, access_token);
    } catch (error) {
      if (error.response === undefined) {
        messageApi.error("An error occoured: " + error.message);
      } else {
        if (error.response.status === 400) {
          messageApi.error(error.response.data.error);
        } else {
          messageApi.error(
            "An unexpected error occoured. (" + error.response.status + ")"
          );
        }
      }
    }
    setLoading(false);
    return { successful: false };
  }, [messageApi]);

  const loginWithPasskey = useCallback(async (email) => {
    if (!email) {
      return { successful: false };
    }
    setLoading(true);
    try {
      const loginOptionsResponse = await axios.post(
        "http://localhost:8080/auth/passkey/login",
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const loginOptions = loginOptionsResponse.data;
      console.log(loginOptions);
      const attestationResponse = await startAuthentication(loginOptions);

      const loginResponse = await axios.post(
        "http://localhost:8080/auth/passkey/login", { email, attestationResponse },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { user, access_token } = loginResponse.data;
      return handleLoginFinished(user, access_token);
    } catch (error) {
      console.log(error);
      messageApi.error("An error occoured: " + error.name);
    }
    setLoading(false);
    return { successful: false };
  }, [messageApi]);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("access_token");
    messageApi.info("Sucessfully logged out.");
  }, [messageApi]);

  const registerPasskey = useCallback(async () => {
    if (!token) {
      return { successful: false };
    }
    setLoading(true);
    try {
      const registerOptionsResponse = await axios.post(
        "http://localhost:8080/auth/passkey/register",
        { token },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const registerOptions = registerOptionsResponse.data;
      console.log(registerOptions);
      const attestationResponse = await startRegistration(registerOptions);
      
      await axios.post(
        "http://localhost:8080/auth/passkey/register",
        attestationResponse,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      messageApi.success("Passkey registered!");
      setLoading(false);
      return { successful: true };
    } catch (error) {
      console.log(error);
      messageApi.error("An error occoured: " + error.name);
    }
    setLoading(false);
    return { successful: false };
  }, [messageApi]);

  useEffect(() => {
    console.log("Token changed!" + token)
    validateToken(token);
  }, [token]); // if token changes, validate it.

  return (
    <>
      {contextHolder}
      <AuthContext.Provider
        value={{
          token,
          loginWithPassword,
          loginWithPasskey,
          logout,
          loading,
          registerPasskey,
          getAuthMode,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};

export { AuthContext, AuthProvider };
