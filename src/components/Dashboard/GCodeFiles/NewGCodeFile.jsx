import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Button, message, Spin, Typography, Select, Flex, Steps, Col, Row, Divider, ColorPicker, Upload, Descriptions, Badge, } from "antd";
import { LoadingOutlined, UploadOutlined, BarcodeOutlined, LinkOutlined } from "@ant-design/icons";

import { AuthContext } from "../../Auth/AuthContext";

import GCodeFileIcon from '../../Icons/GCodeFileIcon';

import FillamentSelect from '../common/FillamentSelect';

const { Dragger } = Upload;


const { Title, Text } = Typography;

const initialNewGCodeFileForm = {
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

const NewGCodeFile = ({ onOk, reset }) => {
  const [messageApi, contextHolder] = message.useMessage();
  
  const [newGCodeFileLoading, setNewGCodeFileLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [nextEnabled, setNextEnabled] = useState(false);
    
  const [newGCodeFileForm] = Form.useForm();
  const [newGCodeFileFormValues, setNewGCodeFileFormValues] = useState(initialNewGCodeFileForm);
  
  const [imageList, setImageList] = useState([]);
  
  const [gcode, setGCode] = useState("");

  const newGCodeFileFormUpdateValues = Form.useWatch([], newGCodeFileForm);
  
  const { token } = useContext(AuthContext);
  
  React.useEffect(() => {
    newGCodeFileForm
      .validateFields({
        validateOnly: true,
      })
      .then(() => setNextEnabled(true))
      .catch(() => setNextEnabled(false));
  }, [newGCodeFileForm, newGCodeFileFormUpdateValues]);
  
  const summaryItems = [
    {
      key: 'name',
      label: 'Name',
      children: newGCodeFileFormValues.name,
    },
    {
      key: 'brand',
      label: 'Brand',
       children: newGCodeFileFormValues.brand,
    },
    {
      key: 'type',
      label: 'Material',
      children: newGCodeFileFormValues.type,
    },
    {
      key: 'price',
      label: 'Price',
      children: "£" + newGCodeFileFormValues.price + " per kg",
    },
    {
      key: 'color',
      label: 'Colour',
      children: (<Badge color={newGCodeFileFormValues.color} text={newGCodeFileFormValues.color} />)
    },
    {
      key: 'diameter',
      label: 'Diameter',
      children: newGCodeFileFormValues.diameter + "mm",
    },
    {
      key: 'image',
      label: 'Image',
      children: (<img src={newGCodeFileFormValues.image} style={{width: 128}}></img>),
    },
    {
      key: 'url',
      label: 'URL',
      children: newGCodeFileFormValues.url,
    },
    {
      key: 'barcode',
      label: 'Barcode',
      children: newGCodeFileFormValues.barcode,
    },
  ];
 
  React.useEffect(() => {
  console.log("reset changed")
    if (reset) {
      console.log("resetting")
      newGCodeFileForm.resetFields();
    }
  }, [reset, newGCodeFileForm])
  
  
  const handleNewGCodeFile = async () => {
    setNewGCodeFileLoading(true);
    try {
      await axios.post(`http://localhost:8080/gcodefiles`, newGCodeFileFormValues, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      messageApi.success('New G Code file created successfully.');
      onOk();
    } catch (error) {
      messageApi.error('Error creating new gcode file: ' + error.message);
    } finally {
      setNewGCodeFileLoading(false);
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
      newGCodeFileForm.setFieldsValue({ image: "" });
      return;
    }
    const base64 = await getBase64(file);
    setNewGCodeFileFormValues((prevValues) => ({
      ...prevValues,
      image: base64,
    }));
    fileList[0].name = "GCodeFile Image"
    setImageList(fileList)
    newGCodeFileForm.setFieldsValue({ image: base64 });
  };
  
  const steps = [
    {
      title: 'Details',
      key: 'details',
      content: (
        <>
          <Form.Item>
            <Text>Please provide the following information:</Text>
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
            label="Material"
            name="material"
            rules={[
              {
                required: true,
                message: 'Please provide a materal.',
              },
            ]}
          >
            <FillamentSelect />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Upload',
      key: 'upload',
      content: (
        <>
          <Form.Item name="gcodefile" rules={[
            {
              required: true,
              message: 'Please upload a gcode file.',
            },
          ]} getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}>
            <Dragger name="G Code File"
            maxCount={1} showUploadList={false}>
              <p className="ant-upload-drag-icon">
                <GCodeFileIcon />
              </p>
              <p className="ant-upload-text">Click or drag .gcode or .g file here.</p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                banned files.
              </p>
              
            </Dragger>
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Preview',
      key: 'preview',
      content: (
        <>
          
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
          <Title level={2} style={{ marginTop: 0 }}>New G Code File</Title>
          <Form
            name="basic"
            autoComplete="off"
            form={newGCodeFileForm}
            onFinish={handleNewGCodeFile}
            onValuesChange={(changedValues) => setNewGCodeFileFormValues((prevValues) => ({
              ...prevValues,
              ...changedValues,
            }))}
            initialValues={initialNewGCodeFileForm}
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
              <Button type="primary" htmlType="submit" loading={newGCodeFileLoading}>
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

export default NewGCodeFile;
