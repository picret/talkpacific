import { Button, Layout, Menu } from "antd";
import { useLearningContext } from "./LearningContext";
import { useEffect } from "react";
import { CommentOutlined, DeleteOutlined } from "@ant-design/icons";
import { ItemType } from "antd/es/menu/hooks/useItems";
import { Conversation, LanguageCoachOptions, LanguageCoachState } from "../languagecoach/LanguageCoach";
import useService from "../base/useService";

const { Sider } = Layout;

interface LearningSiderProps {
  collapsed: boolean;
}

function mapMenuItems(
  conversations: Conversation[],
  onDelete: (conversationId: string) => Promise<void>
): ItemType[] {
  console.log('mapMenuItems:', conversations);
  const conversationItems = conversations.map(convo => {
    // Create a label that includes the conversation text and the delete button
    const label = (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {`with ${convo.primary.key} learn ${convo.learning.key}`}
        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(convo.conversation_id).catch(console.error);
          }}
          size="small"
        />
      </div>
    );
    return getItem(label, convo.conversation_id);
  });

  const startNewConversationItem = getItem('New Conversation', 'new-conversation');
  const items = [startNewConversationItem, ...conversationItems];
  const languageCoachItem = getItem('Conversations', 'conversations', <CommentOutlined />, items, 'divider');
  return [languageCoachItem];
}

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: ItemType[],
  type?: 'group' | 'divider',
): ItemType {
  return { key, icon, children, label, type };
}

const LearningSider: React.FC<LearningSiderProps> = ({ collapsed }) => {
  const { languageCoach } = useLearningContext();
  const { state } = useService(
    languageCoach,
    new LanguageCoachOptions(),
    new LanguageCoachState(),
  );
  const conversations = state.conversations || [];

  const onDelete = async (conversationId: string) => {
    console.log('Deleting: ', conversationId);
    await languageCoach?.deleteConversation(conversationId);
    await languageCoach?.loadConversations();
  }
  const menuItems = mapMenuItems(conversations, onDelete);

  const onSelect = (info: any) => {
    console.log('Selected: ', info);
    if (info.key === 'new-conversation') {
      languageCoach?.setConversation("");
      return;
    }
    languageCoach?.setConversation(info.key);
  };

  useEffect(() => {
    if (!languageCoach) return;

    const loadConversations = async () => {
      try {
        console.log("Loading conversation history...");
        await languageCoach?.loadConversations();
      } catch (error) {
        console.error("Error loading conversation history:", error);
      }
    };
    loadConversations();
  }, [languageCoach]);

  return (
    <Sider width={250} trigger={null} collapsible collapsed={collapsed}>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        onSelect={onSelect}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
};

export default LearningSider;
