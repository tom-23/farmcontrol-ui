// DashboardBreadcrumb.js
import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const breadcrumbNameMap = {
  '/dashboard': 'Dashboard',
  '/dashboard/overview': 'Overview',
  '/dashboard/printers': 'Printers',
  '/dashboard/printers/control': 'Control Printer',
  '/dashboard/printers/edit': 'Edit Printer',
  '/dashboard/printjobs': 'Print Jobs',
  '/dashboard/fillaments': 'Fillaments',
  '/dashboard/gcodefiles': 'G Code Files',
};

const DashboardBreadcrumb = () => {
    const location = useLocation();
    const pathSnippets = location.pathname.split('/').filter(i => i);
  
    const breadcrumbItems = pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      return (
        <Breadcrumb.Item key={url}>
          <Link to={url}>{breadcrumbNameMap[url]}</Link>
        </Breadcrumb.Item>
      );
    });
  
    return (
      <Breadcrumb>
        {breadcrumbItems}
      </Breadcrumb>
    );
  };
  
  export default DashboardBreadcrumb;