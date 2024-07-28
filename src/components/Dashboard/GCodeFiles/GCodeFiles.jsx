// src/gcodefiles.js

import React, { useEffect, useState, useReducer, useContext } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Table, Typography, Badge, Button, Flex, Progress, Space, Tooltip, Modal, Drawer, message } from "antd";
import { InfoCircleOutlined, EditOutlined, LoadingOutlined,  ControlOutlined, PlusOutlined, CopyOutlined } from "@ant-design/icons";

import { AuthContext } from "../../Auth/AuthContext";
import { SocketContext } from "../context/SocketContext";

import NewGCodeFile from "./NewGCodeFile";
import EditGCodeFile from "./EditGCodeFile";


const { Title } = Typography;

const GCodeFiles = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const initialState = {
    error: null,
  };
  
  const [gcodeFilesData, setGCodeFilesData] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [newGCodeFileOpen, setNewGCodeFileOpen] = useState(false);
  const [newGCodeFile, setNewGCodeFile] = useState(null);
  
  const [loading, setLoading] = useState(true);
  
  const [editGCodeFileOpen, setEditGCodeFileOpen] = useState(false);
  const [editGCodeFile, setEditGCodeFile] = useState(null);
  
  const { token, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const navigate = useNavigate();

  const fetchGCodeFilesData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/gcodefiles", {
        params: {
          page: 1,
          limit: 25,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGCodeFilesData(response.data);
      setLoading(false);
      //setPagination({ ...pagination, total: response.data.totalItems }); // Update total count
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    // Fetch initial data
    fetchGCodeFilesData();

  }, [token]);

  // Column definitions
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      
    },
    {
      title: "Material",
      dataIndex: "type",
      key: "type",
      
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "type",
      render: (price) => {
        return "£" + price + " per kg";
      },
    },
    {
      title: "Colour",
      dataIndex: "color",
      key: "color",
      render: (color) => {
        return <Badge color={color} text={color}/>;
      },
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (updated_at) => {
        if (updated_at !== null) {
          const formattedDate = moment(updated_at.$date).format(
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
            <Button type="link" icon={<EditOutlined />} onClick={() => { handleEdit(record.id); }}/>
          </Flex>);
      },
    },
  ];
  
  const handleNew = () => {
    setNewGCodeFileOpen(true);
  };
  
  const handleEdit = (id) => {
    setEditGCodeFile(<EditGCodeFile id={id} onOk={() => { setEditGCodeFileOpen(false); fetchGCodeFilesData(); }} />);
    setEditGCodeFileOpen(true);
  };
  
  return (
    <>
      <Flex vertical={"true"} gap="large">
        {contextHolder}
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNew}>New GCodeFile</Button>
        </Space>
        <Table
          dataSource={gcodeFilesData}
          columns={columns}
          pagination={pagination}
          rowKey="id"
          loading={{ spinning: loading, indicator: <LoadingOutlined spin /> }}
        />
      </Flex>
      <Modal open={newGCodeFileOpen} footer={null} width={700} onCancel={() => { setNewGCodeFileOpen(false); }}>
        <NewGCodeFile onOk={() => { setNewGCodeFileOpen(false); fetchGCodeFilesData(); }} reset={newGCodeFileOpen}/>
      </Modal>
      <Drawer open={editGCodeFileOpen} title={"Edit GCodeFile"} onClose={() => { setEditGCodeFileOpen(false); }}>
        {editGCodeFile}
      </Drawer>
    </>
  );
};

export default GCodeFiles;
