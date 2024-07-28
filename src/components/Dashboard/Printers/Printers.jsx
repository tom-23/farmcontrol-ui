// src/Printers.js

import React, { useEffect, useState, useReducer, useContext } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Table, Typography, Badge, Button, Flex, Progress, Space, Drawer } from "antd";
import { InfoCircleOutlined, EditOutlined, ControlOutlined, LoadingOutlined } from "@ant-design/icons";

import { AuthContext } from "../../Auth/AuthContext";
import { SocketContext } from "../context/SocketContext";

import EditPrinter from "./EditPrinter"

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

const Printers = () => {
  const initialState = {
    printerData: [],
    error: null,
  };
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [state, dispatch] = useReducer(reducer, initialState);
  
  const [loading, setLoading] = useState(true);
  
  const [editPrinterOpen, setEditPrinterOpen] = useState(false);
  const [editPrinter, setEditPrinter] = useState(null);


  const { token, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const navigate = useNavigate();

  const fetchPrintersData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/printers", {
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
  useEffect(() => {
    // Fetch initial data
    fetchPrintersData();
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
  
  const handleEdit = (remoteAddress) => {
    setEditPrinter(<EditPrinter remoteAddress={remoteAddress} onOk={() => { setEditPrinterOpen(false); fetchPrintersData(); }} />);
    setEditPrinterOpen(true);
  };

  // Column definitions
  const columns = [
    {
      title: "Name",
      dataIndex: "friendlyName",
      key: "friendlyName",
    },
    {
      title: "Remote Addresss",
      dataIndex: "remoteAddress",
      key: "remoteAddress",
    },
    {
      title: "Host",
      dataIndex: "hostId",
      key: "hostId",
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        let badgeStatus;
        let badgeText;
    
        switch (status.type) {
          case 'Online':
            badgeStatus = 'success';
            badgeText = 'Online';
            break;
          case 'Offline':
            badgeStatus = 'default';
            badgeText = 'Offline';
            break;
          case 'Initializing':
            badgeStatus = 'warning';
            badgeText = 'Initializing';
            break;
          case 'Printing':
            badgeStatus = 'processing';
            badgeText = 'Printing';
            break;
          case 'Processing':
            badgeStatus = 'processing';
            badgeText = 'Processing';
            break;
          case 'Idle':
            badgeStatus = 'success';
            badgeText = 'Idle';
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
      title: "Connected At",
      dataIndex: "connectedAt",
      key: "connectedAt",
      render: (connectedAt) => {
        if (connectedAt !== null) {
          const formattedDate = moment(connectedAt.$date).format(
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
            <Button type="link" icon={<InfoCircleOutlined />} />
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record.remoteAddress)} />
            <Button type="link" icon={<ControlOutlined />} onClick={() => navigate(`/dashboard/printers/control?remoteAddress=${record.remoteAddress}`)} disabled={record.status.type === "Offline" || record.status.type === "Initializing"} />
          </Flex>);
      },
    },
  ];


  return (
    <>
      <Table
        dataSource={state.printerData}
        columns={columns}
        pagination={pagination}
        rowKey="remoteAddress"
        onChange={handleTableChange}
        loading={{ spinning: loading, indicator: <LoadingOutlined spin /> }}
      />
      <Drawer open={editPrinterOpen} title={"Edit Printer"} onClose={() => { setEditPrinterOpen(false); }}>
        {editPrinter}
      </Drawer>
    </>
  );
};

export default Printers;
