// ChatInputArea.tsx

import React from 'react';
import { Input, Button, Layout } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import useLanguageCoachMessages from '../languagecoach/useLanguageCoachMessages';

const { TextArea } = Input;
const { Footer } = Layout;

interface ChatInputAreaProps {
  input?: string;
  setInput: (value: string) => void;
  handleSendMessage: () => void;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = (props) => {

  const coachMessages = useLanguageCoachMessages();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default to stop adding a new line
      props.handleSendMessage();
    }
  };

  const placeholder = () => {
    return props.input ? undefined : coachMessages.message('chatInputAreaPlaceholder');
  }

  return (
    <Footer style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative' }}>
        <TextArea
          autoSize={{ minRows: 2, maxRows: 10 }}
          value={props.input}
          placeholder={placeholder()}
          onChange={(e) => props.setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ paddingRight: '50px' }}
        />
        <Button
          type="link"
          icon={<SendOutlined />}
          onClick={props.handleSendMessage}
          style={{
            position: 'absolute',
            right: '10px',
            bottom: '10px',
            zIndex: 1
          }}
        />
      </div>
    </Footer>
  );
};

export default ChatInputArea;
