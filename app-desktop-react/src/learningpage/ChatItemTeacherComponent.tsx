import { Component } from 'react';
import { Button, Popover, Spin } from 'antd';
import { SoundOutlined, CheckCircleOutlined } from '@ant-design/icons';
import LearningItemComponent from './LearningItemComponent';
import VoiceSelectorComponent from '../texttoaudio/VoiceSelectorComponent';
import { LearnChatMessage } from '../languagecoach/LanguageCoach';

interface ChatItemTeacherProps {
  item: LearnChatMessage;
}

interface ChatItemTeacherState {
  showVoiceSelector: boolean;
}

class ChatItemTeacherComponent extends Component<ChatItemTeacherProps, ChatItemTeacherState> {
  constructor(props: ChatItemTeacherProps) {
    super(props);
    this.state = { showVoiceSelector: false};
  }
  render() {
    const { item } = this.props;
    
    const voiceButtonStyle = {
      marginTop: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    };

    const voiceContent = (
      <VoiceSelectorComponent language={item.conversation.learning} />
    )

    return (
      <div>
        <div style={voiceButtonStyle}>
          <p style={{ marginRight: "8px" }}>
            <strong>Teacher</strong>
          </p>
          <Popover content={voiceContent} title="Select voice">
            <Button
              type='link'
              icon={<SoundOutlined />}
              onClick={() => this.setState({ showVoiceSelector: true })}
              />
          </Popover>
        </div>
        {
          item.teacherMessage
            ? <LearningItemComponent item={item} />
            : <Spin size="small" style={{ marginLeft: "10px" }} />
        }
        {item.isFinished &&
          <CheckCircleOutlined
            style={{
              color: 'darkgreen',
              position: 'absolute',
              top: '18px',
              right: '18px',
            }} />
        }
      </div>
    )
  }
};

export default ChatItemTeacherComponent;
