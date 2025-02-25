import React from 'react';
import { Select, SelectProps, Typography } from 'antd';

interface LanguageOption {
  value: string;
  label: string;
}

type LanguageSelectProps = SelectProps<string> & {
  title: string;
  options: LanguageOption[];
};

export const LanguageSelect: React.FC<LanguageSelectProps> = (props) => (
  <>
    {props.title ? <Typography.Text strong>{props.title}</Typography.Text> : null}
    <Select
      style={{ width: 180, marginRight: '8px', marginLeft: '4px' }}
      {...props}
    />
  </>
);
