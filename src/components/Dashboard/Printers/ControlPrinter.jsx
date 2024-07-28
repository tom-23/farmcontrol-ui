import React, {
  useEffect,
  useState,
  useContext,
  useReducer,
  useRef,
} from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  message,
  Spin,
  Typography,
  Tag,
  Flex,
  Col,
  Row,
  Dropdown,
  Space,
  Card,
  Upload,
} from "antd";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";

import { AuthContext } from "../../Auth/AuthContext";
import { SocketContext } from "../context/SocketContext";

import DashboardTemperaturePanel from "../common/DashboardTemperaturePanel";
import DashboardMovementPanel from "../common/DashboardMovementPanel";

const { Title } = Typography;

// Action types for reducer
const actionTypes = {
  UPDATE_PRINTER_DATA: "UPDATE_PRINTER_DATA",
  FETCH_DATA_SUCCESS: "FETCH_DATA_SUCCESS",
  FETCH_DATA_FAILURE: "FETCH_DATA_FAILURE",
};

// Reducer function to manage state updates
const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_PRINTER_DATA:
      return {
        ...state,
        printerData: updatePrinterData(state.printerData, action.payload),
      };
    case actionTypes.FETCH_DATA_SUCCESS:
      return {
        ...state,
        printerData: action.payload,
        error: null,
      };
    case actionTypes.FETCH_DATA_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Helper function to update printerData based on wsData
const updatePrinterData = (printerData, newData) => {
  const updatedData = [...printerData]; // Copy current state
  const existingIndex = updatedData.findIndex(
    (printer) => printer.remoteAddress === newData.remoteAddress
  );

  if (existingIndex !== -1) {
    // Update existing entry
    updatedData[existingIndex] = { ...updatedData[existingIndex], ...newData };
  } else {
    // Add new entry
    updatedData.push(newData);
  }

  return updatedData;
};

// Helper function to parse query parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ControlPrinter = () => {
  const initialState = {
    printerData: [],
    error: null,
  };
  const query = useQuery();
  const remoteAddress = query.get("remoteAddress");
  const navigate = useNavigate();
  const [printer, setPrinter] = useState(null);

  const { token, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Fetch printer details when the component mounts
    const fetchPrinterDetails = async () => {
      if (remoteAddress) {
        try {
          const response = await axios.get(
            `http://localhost:8080/printers/${remoteAddress}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setPrinter(response.data);
        } catch (error) {
          message.error("Error fetching printer details");
        }
      }
    };
    fetchPrinterDetails();
  }, [token, logout, remoteAddress]);

  useEffect(() => {
    const joinPrinterRoom = () => {
      if (socket) {
        socket.on("status", (statusUpdate) => {
          console.log("Received status:", statusUpdate);
          dispatch({ type: "UPDATE_WS_DATA", payload: statusUpdate });
        });

        socket.emit("join", { remoteAddress });

        return () => {
          socket.off("status");
          socket.emit("leave", { remoteAddress });
        };
      }
    };
    joinPrinterRoom();
  }, [socket, remoteAddress]);

  const sendCommand = (type, data) => {
    const commandData = {
      remoteAddress,
      type,
      data,
    };
    socket.emit("command", commandData);
  };

  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      sendCommand("writeToSD", {
        filename: "test.g",
        gcode: reader.result,
      });
      message.success("File uploaded successfully");
    };
    reader.readAsText(file);
  };

  const handleUploadFileButtonClick = () => {};

  const uploadProps = {
    beforeUpload: (file) => {
      const isGCODE = file.name.endsWith(".gcode");
      if (!isGCODE) {
        message.error(`${file.name} is not a gcode file`);
      }
      return isGCODE || Upload.LIST_IGNORE;
    },
    onChange: (info) => {
    },
  };

  return (
    <Flex gap="large" vertical="true">
      <Flex gap="middle" horizontal="true">
        <Upload
          {...uploadProps}
          customRequest={({ file, onSuccess }) => {
            handleUpload(file);
            setTimeout(() => {
              onSuccess("ok");
            }, 0);
          }}
        >
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
        <Button
          type="primary"
          onClick={() => handleUploadFileButtonClick()}
          style={{ marginRight: 8 }}
        >
          Upload
        </Button>
      </Flex>
      {printer ? (
        <Row gutter={16}>
          <Col span={8}>
            <Card title="Temperature" bordered={false}>
              <DashboardTemperaturePanel
                remoteAddress={remoteAddress}
              ></DashboardTemperaturePanel>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Movement" bordered={false}>
              <DashboardMovementPanel
                remoteAddress={remoteAddress}
              ></DashboardMovementPanel>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Card title" bordered={false}>
              Card content
            </Card>
          </Col>
        </Row>
      ) : (
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      )}
    </Flex>
  );
};

export default ControlPrinter;
