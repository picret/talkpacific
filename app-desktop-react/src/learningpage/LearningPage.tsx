import { useState } from 'react';

import { ConfigProvider, Layout, ThemeConfig, theme, Typography } from 'antd';

import { LearningHeader } from './LearningHeader';
import { LearningProvider } from './LearningContext';
import LearningChatComponent from './LearningChatComponent';
import LearningSider from './LearningSider';

const LearningPage = () => {
  const { Footer } = Layout;
  const { token: { colorBgContainer } } = theme.useToken();
  const [collapsed, setCollapsed] = useState(true);

  const headerHeight = "64px";
  const mainFooterHeight = "36px";
  const contentCalcHeight = `calc(100vh - ${headerHeight} - ${mainFooterHeight})`;

  const antTheme: ThemeConfig =  {
    components: {
      Layout: {
        footerPadding: "8px",
      },
      Card: {
        actionsLiMargin: "4px",
        actionsBg: "#e6f7ff",
      }
    },
  }

  return (
    <ConfigProvider
      theme={antTheme}
    >
      <LearningProvider>
        <Layout style={{ minHeight: "100vh" }}>
          <LearningSider collapsed={collapsed} />
          <Layout>
            <LearningHeader
              height={headerHeight}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              colorBgContainer={colorBgContainer} />

            <LearningChatComponent calcHeight={contentCalcHeight} />
            <Footer
              style={{
                textAlign: "center",
                height: mainFooterHeight,
                backgroundColor: colorBgContainer,
              }}>
                <Typography.Text type="secondary">
                  TalkPacific ©2025
                </Typography.Text>
            </Footer>
          </Layout>
        </Layout>
      </LearningProvider>
    </ConfigProvider>
  );
}

export default LearningPage;
