import React from 'react';
import Icon from '@ant-design/icons';
import { ReactComponent as CustomIconSvg } from '../../assets/icons/fillamenticon.svg';

const FillamentIcon = (props) => (
  <Icon component={CustomIconSvg} {...props} />
);

export default FillamentIcon;