// src/fillaments.js

import React, { useEffect, useState, useReducer, useContext } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Table, Typography, Badge, Button, Flex, Progress, Space, Tooltip, Modal, Drawer, message } from "antd";
import { InfoCircleOutlined, EditOutlined, LoadingOutlined,  ControlOutlined, PlusOutlined, CopyOutlined } from "@ant-design/icons";

import { AuthContext } from "../../Auth/AuthContext";
import { SocketContext } from "../context/SocketContext";

import NewFillament from "./NewFillament";
import EditFillament from "./EditFillament";


const { Title } = Typography;

const Fillaments = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const initialState = {
    error: null,
  };
  
  const [fillamentsData, setFillamentsData] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [newFillamentOpen, setNewFillamentOpen] = useState(false);
  const [newFillament, setNewFillament] = useState(null);
  
  const [loading, setLoading] = useState(true);
  
  const [editFillamentOpen, setEditFillamentOpen] = useState(false);
  const [editFillament, setEditFillament] = useState(null);
  
  const { token, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const navigate = useNavigate();

  const fetchFillamentsData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/fillaments", {
        params: {
          page: 1,
          limit: 25,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFillamentsData(response.data);
      setLoading(false);
      //setPagination({ ...pagination, total: response.data.totalItems }); // Update total count
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    // Fetch initial data
    fetchFillamentsData();

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
    setNewFillamentOpen(true);
  };
  
  const handleEdit = (id) => {
    setEditFillament(<EditFillament id={id} onOk={() => { setEditFillamentOpen(false); fetchFillamentsData(); }} />);
    setEditFillamentOpen(true);
  };
  
  return (
    <>
      <Flex vertical={"true"} gap="large">
        {contextHolder}
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNew}>New Fillament</Button>
        </Space>
        <Table
          dataSource={fillamentsData}
          columns={columns}
          pagination={pagination}
          rowKey="id"
          loading={{ spinning: loading, indicator: <LoadingOutlined spin /> }}
        />
      </Flex>
      <Modal open={newFillamentOpen} footer={null} width={700} onCancel={() => { setNewFillamentOpen(false); }}>
        <NewFillament onOk={() => { setNewFillamentOpen(false); fetchFillamentsData(); }} reset={newFillamentOpen}/>
      </Modal>
      <Drawer open={editFillamentOpen} title={"Edit Fillament"} onClose={() => { setEditFillamentOpen(false); }}>
        {editFillament}
      </Drawer>
    </>
  );
};

export default Fillaments;
