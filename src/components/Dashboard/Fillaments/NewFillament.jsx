import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Button, message, Spin, Typography, Select, Flex, Steps, Col, Row, Divider, ColorPicker, Upload, Descriptions, Badge } from "antd";
import { LoadingOutlined, UploadOutlined, BarcodeOutlined, LinkOutlined } from "@ant-design/icons";

import { AuthContext } from "../../Auth/AuthContext";

const { Title, Text } = Typography;

const initialNewFillamentForm = {
  name: "",
  brand: "",
  type: "",
  price: 0,
  color: "#FFFFFF",
  diameter: "1.75",
  image: null,
  url: "",
  barcode: "",
};

const NewFillament = ({ onOk, reset }) => {
  const [messageApi, contextHolder] = message.useMessage();
  
  const [newFillamentLoading, setNewFillamentLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [nextEnabled, setNextEnabled] = useState(false);
    
  const [newFillamentForm] = Form.useForm();
  const [newFillamentFormValues, setNewFillamentFormValues] = useState(initialNewFillamentForm);
  
  const [imageList, setImageList] = useState([]);

  const newFillamentFormUpdateValues = Form.useWatch([], newFillamentForm);
  
  const { token } = useContext(AuthContext);
  
  React.useEffect(() => {
    newFillamentForm
      .validateFields({
        validateOnly: true,
      })
      .then(() => setNextEnabled(true))
      .catch(() => setNextEnabled(false));
  }, [newFillamentForm, newFillamentFormUpdateValues]);
  
  const summaryItems = [
    {
      key: 'name',
      label: 'Name',
      children: newFillamentFormValues.name,
    },
    {
      key: 'brand',
      label: 'Brand',
       children: newFillamentFormValues.brand,
    },
    {
      key: 'type',
      label: 'Material',
      children: newFillamentFormValues.type,
    },
    {
      key: 'price',
      label: 'Price',
      children: "£" + newFillamentFormValues.price + " per kg",
    },
    {
      key: 'color',
      label: 'Colour',
      children: (<Badge color={newFillamentFormValues.color} text={newFillamentFormValues.color} />)
    },
    {
      key: 'diameter',
      label: 'Diameter',
      children: newFillamentFormValues.diameter + "mm",
    },
    {
      key: 'image',
      label: 'Image',
      children: (<img src={newFillamentFormValues.image} style={{width: 128}}></img>),
    },
    {
      key: 'url',
      label: 'URL',
      children: newFillamentFormValues.url,
    },
    {
      key: 'barcode',
      label: 'Barcode',
      children: newFillamentFormValues.barcode,
    },
  ];
 
  React.useEffect(() => {
  console.log("reset changed")
    if (reset) {
      console.log("resetting")
      newFillamentForm.resetFields();
    }
  }, [reset, newFillamentForm])
  
  
  const handleNewFillament = async () => {
    setNewFillamentLoading(true);
    try {
      await axios.post(`http://localhost:8080/fillaments`, newFillamentFormValues, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      messageApi.success('New fillament created successfully.');
      onOk();
    } catch (error) {
      messageApi.error('Error creating new fillament: ' + error.message);
    } finally {
      setNewFillamentLoading(false);
    }
  };
  
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
  const handleImageUpload = async ({ file, fileList }) => {
    console.log(fileList);
    if (fileList.length == 0) {
      setImageList(fileList)
      newFillamentForm.setFieldsValue({ image: "" });
      return;
    }
    const base64 = await getBase64(file);
    setNewFillamentFormValues((prevValues) => ({
      ...prevValues,
      image: base64,
    }));
    fileList[0].name = "Fillament Image"
    setImageList(fileList)
    newFillamentForm.setFieldsValue({ image: base64 });
  };
  
  const steps = [
    {
      title: 'Required',
      key: 'required',
      content: (
        <>
          <Form.Item>
            <Text>Required information:</Text>
          </Form.Item>
        
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: 'Please enter a name.',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Brand"
            name="brand"
            rules={[
              {
                required: true,
                message: 'Please enter a brand.',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Material" name="type" rules={[
            {
              required: true,
              message: 'Please select a material.',
            },
          ]}>
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
            rules={[
              {
                required: true,
                message: 'Please enter a price.',
              }]}
          >
            <InputNumber controls={false} formatter={(value) => {
              if (!value) return '£';
              return `£${value}`;
            }} step={0.01} style={{ width: "100%" }} addonAfter="per kg" />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Optional',
      key: 'optional',
      content: (
        <>
          <Form.Item>
            <Text>Optional information:</Text>
          </Form.Item>
        
          <Form.Item
            label="Colour"
            name="color"
            getValueFromEvent={(color) => {
              return "#" + color.toHex();
            }}
          >
            <ColorPicker showText disabledAlpha />
          </Form.Item>
        
          <Form.Item label="Diamenter" name="diameter">
            <Select>
              <Select.Option value="1.75">1.75mm</Select.Option>
              <Select.Option value="2.85">2.85mm</Select.Option>
              <Select.Option value="3.00">3.00mm</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Image" name="image" getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}>
            <Upload
              listType="picture"
              name="Fillament Picture"
              maxCount={1}
              className="upload-list-inline"
              fileList={imageList}
              beforeUpload={() => false} // Prevent automatic upload
              onChange={handleImageUpload}
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
        </>
      ),
    },
    {
      title: 'Summary',
      key: 'done',
      content: (
        <Form.Item>
          <Descriptions column={1} items={summaryItems} size={"small"} />
        </Form.Item>
      ),
    },
  ];
  
  return (
    <Row>
      {contextHolder}
      <Col flex={1}>
        <Steps current={currentStep} items={steps} direction="vertical" style={{ width: "fit-content" }} />
      </Col>
      <Col>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex={3} style={{ paddingLeft: 15, maxWidth: 450 }}>
        <Flex vertical={"true"}>
          <Title level={2} style={{ marginTop: 0 }}>New Fillament</Title>
          <Form
            name="basic"
            autoComplete="off"
            form={newFillamentForm}
            onFinish={handleNewFillament}
            onValuesChange={(changedValues) => setNewFillamentFormValues((prevValues) => ({
              ...prevValues,
              ...changedValues,
            }))}
            initialValues={initialNewFillamentForm}
          >
            {steps[currentStep].content}
          
          <Flex justify={"end"}>
            <Button
              style={{
                margin: '0 8px',
              }}
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={!(currentStep > 0)}>
              Previous
            </Button>
            {currentStep < steps.length - 1 && (
              <Button type="primary" disabled={!nextEnabled} onClick={() => { setCurrentStep(currentStep + 1) }}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" htmlType="submit" loading={newFillamentLoading}>
                Done
              </Button>
            )}
          </Flex>
        </Form>
        </Flex>
        
      </Col>
      
    </Row>
  );
};

export default NewFillament;
