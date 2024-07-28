import React, { useEffect, useState, useContext } from 'react';
import DashboardLayout from './common/DashboardLayout';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Spin, Typography, Tag, Flex } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { AuthContext } from "../Auth/AuthContext";

const { Title } = Typography;

const Profile = () => {

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [printer, setPrinter] = useState(null);

  const { token } = useContext(AuthContext);

  useEffect(() => {
    // Fetch printer details when the component mounts
    const fetchPrinterDetails = async () => {
      if (token) {
        try {
          const response = await axios.get(`http://localhost:8080/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setPrinter(response.data);
          form.setFieldsValue(response.data); // Set form values with fetched data
        } catch (error) {
          message.error('Error fetching printer details');
        }
      }
    };

    fetchPrinterDetails();
  }, [form]);

  const handleFormSubmit = async (values) => {
    setLoading(true);
    // Exclude the 'online' field from the submission
    const { online, remoteAddress, hostId, ...rest } = values;
    try {
      await axios.put(`http://localhost:8080/profile`, rest, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      message.success('Profile updated successfully.');
    } catch (error) {
      message.error('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title>Edit Printer</Title>
      {printer ? (
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
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
          <Form.Item
            label="Status"
            name="online"
            valuePropName="checked"
          >
            {printer.online ? <Tag color="green">Online</Tag> : <Tag color="red">Offline</Tag>}
          </Form.Item>
          <Form.Item>
          <Flex gap="middle" horizontal="true">
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Printer
            </Button>
            <Button onClick={() => navigate(-1)}>Back</Button>
            </Flex>
          </Form.Item>
        </Form>
      ) : (
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      )}
    </div>
  );
};

export default Profile;
