import React, { useEffect, useState, useContext } from 'react';
import DashboardLayout from '../common/DashboardLayout';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Spin, Typography, Tag, Flex, Popconfirm, Skeleton } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { AuthContext } from "../../Auth/AuthContext";
import { SocketContext } from "../context/SocketContext";


const { Title } = Typography;

const EditPrinter = ({ remoteAddress, onOk }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [editPrinterForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [printer, setPrinter] = useState(null);

  const { token, logout } = useContext(AuthContext);

  useEffect(() => {
    // Fetch printer details when the component mounts
    const fetchPrinterDetails = async () => {
      if (remoteAddress) {
        try {
          const response = await axios.get(`http://localhost:8080/printers/${remoteAddress}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setPrinter(response.data);
          editPrinterForm.setFieldsValue(response.data); // Set form values with fetched data
        } catch (error) {
          messageApi.error('Error fetching printer details:' + error.message);
        }
      }
    };

    fetchPrinterDetails();
  }, [remoteAddress, editPrinterForm]);

  const handleEdit = async (values) => {
    setEditLoading(true);
    // Exclude the 'online' field from the submission
    const { online, remoteAddress, hostId, ...rest } = values;
    try {
      await axios.put(`http://localhost:8080/printers/${remoteAddress}`, rest, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      messageApi.success('Printer details updated successfully.');
      onOk();
    } catch (error) {
      messageApi.error('Error updating printer details: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };
  
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:8080/printers/${remoteAddress}`, "", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      messageApi.success('Printer details updated successfully.');
      
    } catch (error) {
      messageApi.error('Error updating printer details: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
    {contextHolder}
    <Skeleton loading={printer == null} active>
        <Form form={editPrinterForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            label="Name"
            name="friendlyName"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Remote Address"
            name="remoteAddress"
            rules={[{ required: true, message: 'Remote Address is required' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Host ID"
            name="hostId"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item>
            <Flex gap="middle" horizontal="true">
              <Button type="primary" htmlType="submit" loading={editLoading}>
                Update
              </Button>
              <Popconfirm
                title="Delete Printer"
                description={"Are you sure you want to delete " + remoteAddress + "?"}
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
              <Button danger>Delete</Button>
              </Popconfirm>
              
            </Flex>
          </Form.Item>
        </Form>
    </Skeleton>
    </>
  );
};

export default EditPrinter;
