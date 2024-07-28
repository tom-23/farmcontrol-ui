import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Spin, Typography, Tag, Flex, Steps } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { AuthContext } from "../../Auth/AuthContext";

const { Title } = Typography;

const NewPrintJob = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(false);
    
  
  const { token } = useContext(AuthContext);
  const handleFormSubmit = async (values) => {
    setLoading(true);
    // Exclude the 'online' field from the submission
    const { online, remoteAddress, hostId, ...rest } = values;
    try {
      await axios.put(`http://localhost:8080/printers/${remoteAddress}`, rest, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      message.success('Printer details updated successfully');
      
    } catch (error) {
      message.error('Error updating printer details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    <Title>Select G-Code</Title>
    <Steps
      current={currentStep}
      items={[
        {
          title: 'Select G-Code',
        },
        {
          title: 'Done',
        },
      ]}
    />
    </div>
  );
};

export default NewPrintJob;
