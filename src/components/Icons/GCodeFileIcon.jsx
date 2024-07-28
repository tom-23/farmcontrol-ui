import React from 'react';
import Icon from '@ant-design/icons';
import { ReactComponent as CustomIconSvg } from '../../assets/icons/gcodefileicon.svg';

const GCodeFileIcon = (props) => (
  <Icon component={CustomIconSvg} {...props} />
);

export default GCodeFileIcon;