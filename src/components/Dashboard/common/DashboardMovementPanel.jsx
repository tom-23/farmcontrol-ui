// DashboardMovementPanel.js
import React, { useContext, useEffect, useState } from "react";
import {
  Layout,
  Progress,
  Typography,
  Spin,
  Flex,
  Space,
  Collapse,
  InputNumber,
  Button,
  Row,
  Col,
  Divider,
  ButtonGroup,
  Radio,
  Slider,
  Dropdown,
  Card,
} from "antd";
import {
  LoadingOutlined,
  ArrowUpOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  ArrowRightOutlined,
  ArrowDownOutlined,
  LineOutlined,
} from "@ant-design/icons";
import { SocketContext } from "../context/SocketContext";
import styled from "styled-components";

const { Text, Link } = Typography;
const { Panel } = Collapse;
const { Header } = Layout;

const CustomCollapse = styled(Collapse)`
  .ant-collapse-header {
    padding: 0 !important;
  }
  .ant-collapse-content-box {
    padding-left: 0 !important;
    padding-right: 0 !important;
    padding-bottom: 0 !important;
  }
`;

const DashboardMovementPanel = ({ remoteAddress }) => {
  const [posValue, setPosValue] = useState(10);
  const [rateValue, setRateValue] = useState(1000);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
    }
  }, [socket]);

  const sendCommand = (type, data) => {
    const commandData = {
      remoteAddress,
      type,
      data,
    };
    console.log(commandData);
    socket.emit("command", commandData);
  };

  const handleSetTemperatureClick = (target, value) => {
    sendCommand("setTemperature", { target, value });
  };

  const handlePosRadioChange = (e) => {
    const value = e.target.value;
    setPosValue(value); // Update posValue state when radio button changes
  };

  const handlePosInputChange = (value) => {
    setPosValue(value); // Update posValue state when input changes
  };

  const handleRateInputChange = (value) => {
    setRateValue(value); // Update rateValue state when input changes
  };

  const handleHomeAxisClick = (axis) => {
    sendCommand("homeAxis", { axis });
  };

  const handleMoveAxisClick = (axis, minus) => {
    var pos;
    const rate = rateValue;
    if (minus) {
      pos = posValue;
    } else {
      pos = posValue * -1
    }
    sendCommand("moveAxis", { axis, pos, rate });
  };

  const homeAxisButtonItems = [
    {
      key: "homeXYZ",
      label: "Home XYZ",
      onClick: () => handleHomeAxisClick("ALL"),
    },
    {
      key: "homeXY",
      label: "Home XY",
      onClick: () => handleHomeAxisClick("X Y"),
    },
    {
      key: "homeX",
      label: "Home X",
      onClick: () => handleHomeAxisClick("X"),
    },
    {
      key: "homeY",
      label: "Home Y",
      onClick: () => handleHomeAxisClick("Y"),
    },
    {
      key: "homeZ",
      label: "Home Z",
      onClick: () => handleHomeAxisClick("Z"),
    },
  ];

  return (
    <div style={{ minWidth: 190 }}>
      <Flex vertical gap={"large"}>
        <Flex horizontal="true" gap="small">
          <Card size="small" title="XY">
            <Flex vertical align="center" justify="center" gap="small" style={{ height: "100%"}}>
              <Button icon={<ArrowUpOutlined />} onClick={() => { handleMoveAxisClick("Y", false); }}/>
              <Space>
                <Button icon={<ArrowLeftOutlined />} onClick={() => { handleMoveAxisClick("X", false); }}/>
                <Dropdown menu={{ items: homeAxisButtonItems }} placement="bottom">
                  <Button icon={<HomeOutlined />}></Button>
                </Dropdown>
                <Button icon={<ArrowRightOutlined />} onClick={() => { handleMoveAxisClick("X", true); }}/>
              </Space>
              <Button icon={<ArrowDownOutlined />} onClick={() => { handleMoveAxisClick("Y", true); }}></Button>
            </Flex>
          </Card>
          <Card size="small" title="Z">
            <Flex vertical align="center" justify="center" gap="small" style={{ height: "100%" }}>
              <Button icon={<ArrowUpOutlined />} />
              <Button icon={<LineOutlined />} />
              <Button icon={<ArrowDownOutlined />}></Button>
            </Flex>
          </Card>
          <Card size="small" title="E">
          <Flex vertical align="center" justify="center" gap="small" >
            <Button icon={<ArrowUpOutlined />} />
            <Button icon={<ArrowDownOutlined />}></Button>
          </Flex>
          </Card>
        </Flex>
        <Flex vertical gap="small">
          <Radio.Group
            onChange={handlePosRadioChange}
            value={posValue}
            name="posRadio"
          >
            <Radio.Button value={0.1}>0.1</Radio.Button>
            <Radio.Button value={1}>1</Radio.Button>
            <Radio.Button value={10}>10</Radio.Button>
            <Radio.Button value={100}>100</Radio.Button>
          </Radio.Group>
          <Flex horizontal="true" gap="small">
            <InputNumber
              min={0.1}
              max={100}
              value={posValue}
              formatter={(value) => `${value} mm`}
              parser={(value) => value?.replace(" mm", "")}
              onChange={handlePosInputChange}
              placeholder="10 mm"
              name="posInput"
            />
            <InputNumber
              min={1}
              max={5000}
              value={rateValue}
              formatter={(value) => `${value} mm/s`}
              parser={(value) => value?.replace(" mm/s", "")}
              onChange={handleRateInputChange}
              placeholder="100 mm/s"
              name="rateInput"
            />
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
};

export default DashboardMovementPanel;
