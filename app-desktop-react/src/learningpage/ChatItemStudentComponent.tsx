import React from 'react';
import { Button } from 'antd';
import { LearnChatMessage } from '../languagecoach/LanguageCoach';
import { SpeechToTextOptions, SpeechToTextState } from '../speechtotext/SpeechToText';
import { AudioMutedOutlined, AudioOutlined } from '@ant-design/icons';
import { createSpeechToText } from './LearningContext';
import useService from '../base/useService';

interface ChatItemUserProps {
  item: LearnChatMessage;
}

const renderTextLines = (text?: string) => {
  return text?.split('\n').map((line, index) => (
    <React.Fragment key={`line-${index}`}>
      {line}
      <br />
    </React.Fragment>
  ));
}

const ChatItemUserComponent = ({ item }: ChatItemUserProps) => {
  const speechToText = createSpeechToText();
  const { options, state } = useService(
    speechToText,
    new SpeechToTextOptions(),
    new SpeechToTextState(),
  );

  const toggleListening = () => {
    if (state?.isListening) {
      speechToText?.stopListening();
      options.language = undefined;
    } else {
      options.language = item.conversation.learning;
      speechToText?.startListening();
    }
  };

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <Button
          type="primary"
          onClick={toggleListening}
          icon={state?.isListening ? <AudioMutedOutlined /> : <AudioOutlined />}
          style={{ marginRight: '8px' }}>
          {state?.isListening ? formatTime(state.elapsedTime) : ""}
        </Button>
        {state?.outputText && (
          <p style={{ marginLeft: '4px', fontStyle: 'italic' }}>said {state.outputText}</p>
        )}
        <audio controls style={{ flexGrow: 1 }} src={state.inputAudioUrl} />
      </div>
      <div style={{ backgroundColor: '#f4f4f4', padding: '8px', borderRadius: '4px' }}>
        {renderTextLines(item.userMessage)}
      </div>
    </div>
  )
}


export default ChatItemUserComponent;
