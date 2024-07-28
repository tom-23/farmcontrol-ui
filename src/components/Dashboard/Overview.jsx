import React, { useEffect, useState } from 'react';
import DashboardLayout from './common/DashboardLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Overview = ({ setToken }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const access_token = localStorage.getItem('access_token');
      if (access_token) {
        try {
          const response = await axios.get('http://localhost:8080/overview', {
            headers: {
              Authorization: `Bearer ${access_token}`
            }
          });
          //setUser(response.data);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchUserData();
  }, [setToken, navigate]);

  return (
    <div>
      <h2>Overview</h2>
      {user ? (
        <div>
          <p>Welcome, {user.username}!</p>
          <button >Logout</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Overview;
