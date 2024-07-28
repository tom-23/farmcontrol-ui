// src/PrintJobs.js

import React, { useEffect, useState, useReducer, useContext } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Table, Typography, Badge, Button, Flex, Progress, Space, Tooltip, Modal, message } from "antd";
import { InfoCircleOutlined, EditOutlined, ControlOutlined, PlusOutlined, CopyOutlined, LoadingOutlined } from "@ant-design/icons";

import { AuthContext } from "../../Auth/AuthContext";
import { SocketContext } from "../context/SocketContext";

import NewPrintJob from "./NewPrintJob";


const { Title } = Typography;

// Action types for reducer
const actionTypes = {
  UPDATE_PRINTER_DATA: 'UPDATE_PRINTER_DATA',
  FETCH_DATA_SUCCESS: 'FETCH_DATA_SUCCESS',
  FETCH_DATA_FAILURE: 'FETCH_DATA_FAILURE',
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
        printJobsData: action.payload,
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
  const existingIndex = updatedData.findIndex(printer => printer.remoteAddress === newData.remoteAddress);

  if (existingIndex !== -1) {
    // Update existing entry
    const existingEntry = updatedData[existingIndex];
    const updatedEntry = { ...existingEntry };

    // Update only the parameters that exist in newData
    for (const param in newData) {
      if (newData.hasOwnProperty(param)) {
        updatedEntry[param] = newData[param];
      }
    }

    updatedData[existingIndex] = updatedEntry;
  } else {
    // Add new entry
    updatedData.push(newData);
  }

  return updatedData;
};

const PrintJobs = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const initialState = {
    printJobsData: [],
    error: null,
  };
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [state, dispatch] = useReducer(reducer, initialState);
  const [newPrintJobOpen, setNewPrintJobOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  
  const { token, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/printjobs", {
          params: {
            page: 1,
            limit: 25,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLoading(false);
        dispatch({ type: actionTypes.FETCH_DATA_SUCCESS, payload: response.data });
        //setPagination({ ...pagination, total: response.data.totalItems }); // Update total count
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();

  }, [token]);

  useEffect(() => {
    if (socket) {
      socket.on("status", (statusUpdate) => {
        console.log("Received status:", statusUpdate);
        dispatch({ type: "UPDATE_PRINTER_DATA", payload: statusUpdate });
      });

      return () => {
        socket.off("status");
      };
    }
  }, [socket]);


  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination); // Update pagination state on table change
  };

  // Column definitions
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <span>
          {text.slice(-8)}
          <Tooltip title="Copy ID" arrow={false}>
            <Button
              icon={<CopyOutlined />}
              type="link"
              style={{ marginLeft: 8 }}
              onClick={() => {
                navigator.clipboard.writeText(text).then(() => {
                  messageApi.success('ID copied to clipboard');
                }).catch(() => {
                  messageApi.error('Failed to copy ID');
                });
              }}
            />
          </Tooltip>
        </span>
      )
    },
    { 
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        let badgeStatus;
        let badgeText;
    
        switch (status.type) {
          case 'Queued':
            badgeStatus = 'warning';
            badgeText = 'Queued';
            break;
          case 'Draft':
            badgeStatus = 'default';
            badgeText = 'Draft';
            break;
          case 'Printing':
            badgeStatus = 'processing';
            badgeText = 'Printing';
            break;
          case 'Error':
            badgeStatus = 'error';
            badgeText = 'Error';
            break;
          default:
            badgeStatus = 'default';
            badgeText = 'Unknown';
        }
    
        return (
          <Badge status={badgeStatus} text={badgeText} />
        );
      },
    },
    {
      title: "Print Job",
      dataIndex: "status",
      key: "printJob",
      width: "15%",
      render: (status) => {
        if (status.type == "Printing") {
          return (
            <Progress percent={status.percent} />
          );
        }
      },
    },
    {
      title: "Print Job Started At",
      dataIndex: "started_at",
      key: "started_at",
      render: (started_at) => {
        if (started_at !== null) {
          const formattedDate = moment(started_at.$date).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          return <span>{formattedDate}</span>;
        } else {
          return "n/a";
        }
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (created_at) => {
        if (created_at !== null) {
          const formattedDate = moment(created_at.$date).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          return <span>{formattedDate}</span>;
        } else {
          return "n/a";
        }
      },
    },
    {
      title: "Actions",
      key: "operation",
      fixed: "right",
      width: 100,
      render: (text, record) => {
        return (
          <Flex gap="small" horizontal="true">
            <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/dashboard/printjobs/edit?id=${record.id}`)} />
          </Flex>);
      },
    },
  ];
  
  const showNewPrintJobModal = () => {
    setNewPrintJobOpen(true);
  };
  
  return (
    <>
      <Flex vertical={"true"} gap="large">
        {contextHolder}
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={showNewPrintJobModal}>New Print Job</Button>
        </Space>
        <Table
          dataSource={state.printJobsData}
          columns={columns}
          pagination={pagination}
          rowKey="remoteAddress"
          onChange={handleTableChange}
          loading={{ spinning: loading, indicator: <LoadingOutlined spin /> }}
        />
      </Flex>
      <Modal open={newPrintJobOpen} footer={null}>
      <NewPrintJob/>
      </Modal>
    </>
  );
};

export default PrintJobs;
