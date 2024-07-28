// FillamentSelect.js
import { TreeSelect, Badge } from 'antd';
import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from "../../Auth/AuthContext";

const propertyOrder = ['diameter', 'type', 'brand'];

const FillamentSelect = ({ onChange }) => {
  const [fillamentsData, setFillamentsData] = useState([]);
  const [fillamentsTreeData, setFillamentsTreeData] = useState([]);
  const { token, logout } = useContext(AuthContext);
  const tokenRef = useRef(token);
  const [loading, setLoading] = useState(true);
      
  const fetchFillamentsData = async (property, filter) => {
    console.log("Current ref", tokenRef);
    try {
      const response = await axios.get("http://localhost:8080/fillaments", {
        params: {
          ...filter,
          property,
        },
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
        },
      });
      setLoading(false);
      return response.data;
      //setPagination({ ...pagination, total: response.data.totalItems }); // Update total count
    } catch (err) {
      console.error(err);
    }
  };
  
  const getFilter = (node) => {
    var filter = {};
    var currentId = node.id;
    while (currentId != 0) {
      const currentNode = fillamentsTreeData.filter(treeData => treeData['id'] == currentId)[0]
      filter[propertyOrder[currentNode.propertyId]] = currentNode.value.split("-")[0];
      currentId = currentNode.pId;
    }
    return filter;
  }
  
  const generateFillamentTreeNodes = async (node = null) => {
    if (!node) {
      return;
    }
    
    const fillamentData = await fetchFillamentsData(null, getFilter(node));
    
    let newNodeList = [];
    
    for (var i = 0; i < fillamentData.length; i++) {
      
      const fillament = fillamentData[i];
      const random = Math.random().toString(36).substring(2, 6);
      
      const newNode = {
        id: random,
        pId: node.id,
        value: fillament._id,
        key: fillament._id,
        title: (<Badge color={fillament.color} text={fillament.name}/>),
        isLeaf: true
      }
      
      newNodeList.push(newNode);
    }
    
    setFillamentsTreeData(fillamentsTreeData.concat(newNodeList))
    console.log(newNodeList);
  };
    
  const generateFillamentCategoryTreeNodes = async (node = null) => {
    var filter = {};
    console.log("Init node: ", node);
    var propertyId = 0;
  
    if (!node) {
      node = {};
      node.id = 0;
    } else {
      filter = getFilter(node);
      propertyId = node.propertyId + 1;
    }
    
    
    const propertyName = propertyOrder[propertyId];
    
    console.log("Next Property Id", propertyId)
    console.log("Filter", filter);
    
    const propertyData = await fetchFillamentsData(propertyName, filter)
    
    let newNodeList = [];
    
    for (var i = 0; i < propertyData.length; i++) {
      
      const property = propertyData[i][propertyName];
      const random = Math.random().toString(36).substring(2, 6);
      
      const newNode = {
        id: random,
        pId: node.id,
        value: property + "-" + random,
        key: property + "-" + random,
        propertyId: propertyId,
        title: property,
        isLeaf: false,
        selectable: false
      }
      
      newNodeList.push(newNode);
    }
    
    setFillamentsTreeData(fillamentsTreeData.concat(newNodeList))
    console.log(newNodeList);
  };
    
  const handleFillamentsTreeLoad = async (node) => {
    console.log(node);
    if (node) {
      if (node.propertyId != propertyOrder.length - 1) {
        generateFillamentCategoryTreeNodes(node); 
      } else {
        console.log("Generating printer node...");
        generateFillamentTreeNodes(node); // End of properties
      }
    } else {
      generateFillamentCategoryTreeNodes(null); // First property
    }
  };
  
  useEffect(() => {
    if (fillamentsTreeData.length == 0) {
      handleFillamentsTreeLoad(null)
    }
  }, [token]);
  
  return (
    <TreeSelect treeDataSimpleMode loadData={handleFillamentsTreeLoad} treeData={fillamentsTreeData} onChange={onChange}>
        
    </TreeSelect>
  );
};
  
export default FillamentSelect;