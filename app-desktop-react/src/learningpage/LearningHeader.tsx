import React from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Layout, Button } from 'antd';

const { Header } = Layout;

interface LearningHeaderProps {
  height: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  colorBgContainer: string;
}

export const LearningHeader: React.FC<LearningHeaderProps> = (props) => {

  return (
    <Header style={{
      padding: 0,
      background: props.colorBgContainer,
      height: props.height,
    }}>
      <Button
        type="text"
        icon={props.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => props.setCollapsed(!props.collapsed)}
        style={{
          width: 64,
          height: 64,
        }}
      />
    </Header>
  );
}
