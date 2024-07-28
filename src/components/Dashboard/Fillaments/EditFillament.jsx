import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Button, message, Spin, Typography, Select, Flex, Steps, Col, Row, Skeleton, ColorPicker, Upload, Descriptions, Badge, Popconfirm } from "antd";
import { LoadingOutlined, UploadOutlined, BarcodeOutlined, LinkOutlined } from "@ant-design/icons";

import { AuthContext } from "../../Auth/AuthContext";

const { Title, Text } = Typography;

const EditFillament = ({ id, onOk }) => {
  const [messageApi, contextHolder] = message.useMessage();
  
  const [dataLoading, setDataLoading] = useState(false);
  const [editFillamentLoading, setEditFillamentLoading] = useState(false);
  const [deleteFillamentLoading, setDeleteFillamentLoading] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [fillament, setFillament] = useState(null);
  
  const [imageList, setImageList] = useState([]);
  const [image, setImage] = useState("");
    
  const [editFillamentForm] = Form.useForm();
  const [editFillamentFormValues, setEditFillamentFormValues] = useState({});
  
  const { token } = useContext(AuthContext);
  
  useEffect(() => {
    // Fetch printer details when the component mounts
    const fetchFillamentDetails = async () => {
      if (id) {
        try {
          setDataLoading(true);
          const response = await axios.get(`http://localhost:8080/fillaments/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setDataLoading(false);
          editFillamentForm.setFieldsValue(response.data); // Set form values with fetched data
          setEditFillamentFormValues(response.data);
        } catch (error) {
          messageApi.error('Error fetching printer details:' + error.message);
        }
      }
    };
    fetchFillamentDetails();
  }, [id, editFillamentForm, token]);
  
  const handleEditFillament = async () => {
    setEditFillamentLoading(true);
    // Exclude the 'online' field from the submission
    try {
      await axios.put(`http://localhost:8080/fillaments/${id}`, editFillamentFormValues, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      messageApi.success('Fillament details updated successfully.');
      onOk();
    } catch (error) {
      messageApi.error('Error updating fillament details: ' + error.message);
    } finally {
      setEditFillamentLoading(false);
    }
  };
  
  const handleDeleteFillament = async () => {
    setDeleteFillamentLoading(true);
    try {
      await axios.delete(`http://localhost:8080/fillaments/${id}`, "", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      messageApi.success('Fillament deleted successfully.');
      onOk();
    } catch (error) {
      messageApi.error('Error updating fillament details: ' + error.message);
    } finally {
      setDeleteFillamentLoading(false);
    }
  };

  const handleImageUpload = ({ file, onSuccess }) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("Setting image buffer", e.target.result);
      //setImage(e.target.result);
      onSuccess("ok");
    };
    reader.readAsDataURL(file);
  };
  return (
    <>
      {contextHolder}
      <Spin spinning={dataLoading} indicator={<LoadingOutlined spin />} size="large">
        <Form
          name="editFillamentForm"
          autoComplete="off"
          form={editFillamentForm}
          initialValues={editFillamentFormValues}
          onFinish={handleEditFillament}
          onValuesChange={(changedValues) => setEditFillamentFormValues((prevValues) => ({
            ...prevValues,
            ...changedValues,
          }))}
        >  
          <Form.Item
            label="Name"
            name="name"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Brand"
            name="brand"
          >
            <Input />
          </Form.Item>
          <Form.Item label="Material" name="type">
            <Select>
              <Select.Option value="PLA">PLA</Select.Option>
              <Select.Option value="PETG">PETG</Select.Option>
              <Select.Option value="ABS">ABS</Select.Option>
              <Select.Option value="ASA">ASA</Select.Option>
              <Select.Option value="HIPS">HIPS</Select.Option>
              <Select.Option value="TPU">TPU</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
          >
            <InputNumber controls={false} formatter={(value) => {
              if (!value) return '£';
              return `£${value}`;
            }} step={0.01} style={{ width: "100%" }} addonAfter="per kg" />
          </Form.Item>
          
          <Form.Item
            label="Colour"
            name="color"
            getValueFromEvent={(color) => {
              return "#" + color.toHex();
            }}
          >
            <ColorPicker showText disabledAlpha/>
          </Form.Item>
      
          <Form.Item label="Diamenter" name="diameter">
            <Select>
              <Select.Option value="1.75">1.75mm</Select.Option>
              <Select.Option value="2.85">2.85mm</Select.Option>
              <Select.Option value="3.00">3.00mm</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Image" name="image">
            <Upload
              listType="picture"
              maxCount={1}
              className="upload-list-inline"
              fileList={imageList}
              customRequest={handleImageUpload}
              onChange={({ fileList }) => { setImageList(fileList) }}
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="URL" name="url">
            <Input
              prefix={<LinkOutlined />}
            />
          </Form.Item>
          <Form.Item label="Barcode" name="barcode">
            <Input
              prefix={<LinkOutlined />}
            />
          </Form.Item>
          <Form.Item>
          <Flex gap="middle" horizontal="true">
            <Button type="primary" htmlType="submit" loading={editFillamentLoading}>
              Update
            </Button>
            <Popconfirm
              title="Delete Fillament"
              description={"Are you sure you want to delete " + editFillamentFormValues.name + "?"}
              onConfirm={handleDeleteFillament}
              okText="Yes"
              cancelText="No"
            >
            <Button danger>Delete</Button>
            </Popconfirm>
            
          </Flex>
          </Form.Item>
        </Form>
  
      </Spin>
    </>
  );
};

export default EditFillament;
