import { List, Layout } from 'antd';
import { useLearningContext } from './LearningContext';
import useService from '../base/useService';
import LearningStreamChatItem from './LearningStreamChatItem';
import { CreateConversationOptions, LanguageCoachOptions, LanguageCoachState } from '../languagecoach/LanguageCoach';
import ChatInputArea from './ChatInputArea';
import CreateConversationForm from './CreateConversationForm';

const { Content } = Layout;

const LearningChatComponent = ({ calcHeight }: { calcHeight: string }) => {
  const { languageCoach } = useLearningContext();
  const { options, state } = useService(
    languageCoach,
    new LanguageCoachOptions(),
    new LanguageCoachState(),
  );

  const handleSendMessage = () => {
    if (options.inputText && options.inputText.length > 0) {
      languageCoach?.send();
    }
  };

  const setInput = (input?: string): void => {
    languageCoach?.updateOptions({inputText: input});
  }

  if (!state.conversation) {
    const handleSubmit = async (options: CreateConversationOptions) => {
      console.log('Received values of form: ', options);
      const conversation = await languageCoach?.createConversation(options);
      console.log('Created conversation: ', conversation);
      await languageCoach?.loadConversations();
      console.log('created conversation', conversation);
    }
    return (
      <Layout style={{ height: calcHeight }}>
        <Content
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <CreateConversationForm onSubmit={handleSubmit} />
        </Content>
      </Layout>
    )
  }

  return (
    <Layout style={{ height: calcHeight }}>
      <Content
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '10px'
        }}>
        <div style={{
          overflowY: 'auto',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column-reverse',
          marginBottom: '10px'
        }}>
          <List
            dataSource={state.messages}
            renderItem={item => (
              <List.Item key={item.position} style={{ marginBottom: '10px' }}>
                <LearningStreamChatItem item={item} />
              </List.Item>
            )}
          />
        </div>
        <ChatInputArea
          input={options.inputText}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
        />
      </Content>
    </Layout>
  );
};

export default LearningChatComponent;
