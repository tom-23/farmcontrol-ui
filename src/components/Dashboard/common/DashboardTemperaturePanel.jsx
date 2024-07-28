// DashboardTemperaturePanel.js
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
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
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

const DashboardTemperaturePanel = ({
  remoteAddress,
  showControls = true,
  showMoreInfo = true,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [hotEndTemperature, setHotEndTemperature] = useState(0);
  const [heatedBedTemperature, setHeatedBedTemperature] = useState(0);
  const [temperatureData, setTemperatureData] = useState(null);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
      socket.on("temperature", (data) => {
        setTemperatureData(data.temperatures);
      });
      return () => {
        socket.off("temperature");
      };
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

  const moreInfoItems = [
    {
      key: "1",
      label: "More Temperature Data",
      children: 
        <Panel>
          {temperatureData ? (
            <>
              {typeof temperatureData.hotendPower !== "undefined" && (
                <Flex vertical gap={0}>
                  <Text>
                    Hot End Power:{" "}
                    {Math.round((temperatureData.hotendPower / 127) * 100)}%
                  </Text>
                  <Progress
                    percent={(temperatureData.hotendPower / 127) * 100}
                    showInfo={false}
                  />
                </Flex>
              )}

              {typeof temperatureData.bedPower !== "undefined" && (
                <Flex vertical gap={0}>
                  <Text>
                    Bed Power:{" "}
                    {Math.round((temperatureData.bedPower / 127) * 100)}%
                  </Text>
                  <Progress
                    percent={(temperatureData.bedPower / 127) * 100}
                    showInfo={false}
                  />
                </Flex>
              )}

              {typeof temperatureData.pindaTemp !== "undefined" && (
                <Flex vertical gap={0}>
                  <Text>Pinda Temp: {temperatureData.pindaTemp}°C</Text>
                </Flex>
              )}

              {typeof temperatureData.ambiantActual !== "undefined" && (
                <Flex vertical gap={0}>
                  <Text>Ambient Actual: {temperatureData.ambiantActual}°C</Text>
                </Flex>
              )}
            </>
          ) : (
            <Flex justify="centre">
              <Spin indicator={<LoadingOutlined spin />} size="large" />
            </Flex>
          )}
        </Panel>
    },
  ];

  return (
    <div style={{ minWidth: 190 }}>
      {temperatureData ? (
        <Flex vertical gap="middle">
          {temperatureData.hotEnd && (
            <Flex vertical gap={0}>
              <Text>
                Hot End: {temperatureData.hotEnd.current}°C /{" "}
                {temperatureData.hotEnd.target}°C
              </Text>
              <Progress
                percent={(temperatureData.hotEnd.target / 300) * 100}
                strokeColor="#FF392F1D"
                success={{
                  percent: (temperatureData.hotEnd.current / 300) * 100,
                  strokeColor: "#FF3B2F",
                }}
                showInfo={false}
              />
              {showControls === true && (
                <Space direction="horizontal" style={{ marginTop: 5 }}>
                  <Space.Compact block size="small">
                    <InputNumber
                      value={hotEndTemperature}
                      min={0}
                      max={300}
                      formatter={(value) => `${value}°C`}
                      parser={(value) => value.replace("°C", "")}
                      onChange={(value) => setHotEndTemperature(value)}
                    />
                    <Button
                      type="default"
                      onClick={() =>
                        handleSetTemperatureClick("hotEnd", hotEndTemperature)
                      }
                    >
                      Set
                    </Button>
                  </Space.Compact>
                  <Button
                    type="default"
                    size="small"
                    onClick={() => handleSetTemperatureClick("hotEnd", 0)}
                  >
                    Off
                  </Button>
                </Space>
              )}
            </Flex>
          )}

          {temperatureData.heatedBed && (
            <Flex vertical gap={0}>
              <Text>
                Heated Bed: {temperatureData.heatedBed.current}°C /{" "}
                {temperatureData.heatedBed.target}°C
              </Text>
              <Progress
                percent={(temperatureData.heatedBed.target / 300) * 100}
                strokeColor="#FF392F1D"
                success={{
                  percent: (temperatureData.heatedBed.current / 300) * 100,
                  strokeColor: "#FF3B2F",
                }}
                showInfo={false}
              />
              {showControls === true && (
                <Space direction="horizontal" style={{ marginTop: 5 }}>
                  <Space.Compact block size="small">
                    <InputNumber
                      value={heatedBedTemperature}
                      min={0}
                      max={300}
                      formatter={(value) => `${value}°C`}
                      parser={(value) => value.replace("°C", "")}
                      onChange={(value) => setHeatedBedTemperature(value)}
                    />
                    <Button
                      type="default"
                      onClick={() =>
                        handleSetTemperatureClick(
                          "heatedBed",
                          heatedBedTemperature
                        )
                      }
                    >
                      Set
                    </Button>
                  </Space.Compact>
                  <Button
                    type="default"
                    size="small"
                    onClick={() => handleSetTemperatureClick("heatedBed", 0)}
                  >
                    Off
                  </Button>
                </Space>
              )}
            </Flex>
          )}
          {showMoreInfo === true && (
            <CustomCollapse ghost size="small" items={moreInfoItems} />
          )}
        </Flex>
      ) : (
        <Flex justify="centre">
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </Flex>
      )}
    </div>
  );
};

export default DashboardTemperaturePanel;
