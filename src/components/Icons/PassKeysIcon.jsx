import React from 'react';
import Icon from '@ant-design/icons';
import { ReactComponent as CustomIconSvg } from '../../assets/icons/passkeysicon.svg';

const PassKeysIcon = (props) => (
  <Icon component={CustomIconSvg} {...props} />
);

export default PassKeysIcon;