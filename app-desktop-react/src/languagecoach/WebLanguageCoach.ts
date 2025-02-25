import { PlatformState } from '../platform/PlatformContext';
import {
  Conversation,
  CreateConversationOptions,
  LanguageCoach,
  LanguageCoachOptions,
  LanguageCoachState,
  LearnChatMessage,
 } from './LanguageCoach';
import { getLanguageByKey } from './Languages';

class WebLanguageCoach extends LanguageCoach {
  private platformState: PlatformState;
  private eventSource?: EventSource;

  constructor(platformState: PlatformState) {
    super();
    this.platformState = platformState;
  }

  public async send(): Promise<boolean> {
    const options: LanguageCoachOptions = this.getOptions();
    const inputText = options.inputText;
    if (!inputText) {
      console.error('No input text to send');
      return false;
    }
    const conversation = this.getState().conversation;
    if (!conversation) {
      console.error('No conversation to send message');
      return false;
    }
    const state: LanguageCoachState = this.updateState({ isThinking: true });
    console.log('send message', options, state);
    this.updateOptions({ inputText: undefined });
    const position = state.messages[state.messages.length - 1]?.position + 1 || 0;
    const responseMessage: LearnChatMessage = {
      conversation: conversation,
      position: position,
      userMessage: inputText,
      teacherMessage: '',
      isFinished: false,
    };
    this.updateStateFrom(state => ({
      messages: [...state.messages, responseMessage],
    }));
    const apiUrl = this.platformState.appApiBase;
    const url = new URL(`${apiUrl}/send-message`);
    url.search = new URLSearchParams({
      conversation_id: conversation.conversation_id,
      message: inputText,
    }).toString();

    console.log('send', url)
    const eventSource = new EventSource(url);
    this.eventSource = eventSource;

    eventSource.onerror = (error) => {
      const errorReason = `EventSource failed: ${error}, ${eventSource.readyState}`;
      this.closeSend(errorReason)
      return false;
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      let updatedMessages = [...this.getState().messages];
      const messageIndex = updatedMessages.findIndex(message => message.position === position);
      if (messageIndex >= 0) {
        responseMessage.teacherMessage = responseMessage.teacherMessage + data.delta;
        responseMessage.isFinished = data.is_finished;
        responseMessage.learningPhrases = data.learning_phrases ? data.learning_phrases : [];
        updatedMessages[messageIndex] = responseMessage;
        this.updateState({
          messages: updatedMessages,
        });
        if (data.is_finished) {
          this.closeSend()
          return true;
        }
      } else {
        this.closeSend(`Message at position ${position} not found`)
        return false;
      }
    };
    return true;
  }

  public async createConversation(options: CreateConversationOptions): Promise<Conversation | undefined> {
    console.log('createConversation', options)

    const apiUrl = this.platformState.appApiBase;
    const url = new URL(`${apiUrl}/create-conversation`);
    url.search = new URLSearchParams({
      primary: options.primary.key,
      learning: options.learning.key,
    }).toString();

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('create conversation success', data)
      const conversation: Conversation = {
        conversation_id: data.conversation_id,
        primary: options.primary,
        learning: options.learning,
      };
      this.updateState({ conversation: conversation });
      return conversation;
    } catch (error) {
      this.closeSend(`Error creating conversation: ${error}`);
      return undefined;
    }
  }

  public async loadConversations(): Promise<Conversation[]> {
    const apiUrl = this.platformState.appApiBase;
    const url = new URL(`${apiUrl}/conversations`);
    console.log('load conversations')
    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const conversations: Conversation[] = data.items.map((item: any) => ({
        conversation_id: item.conversation_id,
        primary: getLanguageByKey(item.primary),
        learning: getLanguageByKey(item.learning),
      }));
      this.updateState({ conversations: conversations });
      console.log('loaded conversations', conversations)
      return conversations;
    } catch (error) {
      console.error("Error loading conversation history:", error);
      return [];
    }
  }

  public async deleteConversation(conversationId: string): Promise<boolean> {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      console.error('Cannot deleteConversation as conversation is not found:', conversationId);
      return false;
    }
    this.updateState({
      conversation: undefined,
      messages: [],
    });

    const apiUrl = this.platformState.appApiBase;
    const url = `${apiUrl}/delete-conversation`;
    const requestBody = {
      conversation_id: conversationId,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return false;
      }

      const data = await response.json();

      if (data.status === 'ok') {
        console.log('delete conversation success');
        this.updateState({
          conversations: undefined,
          messages: [],
        });
        return true;
      } else {
        console.log(`Error deleting messages: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting messages:', error);
    } finally {
      return false;
    }
  }



  protected async loadMessages(conversationId: string): Promise<LearnChatMessage[]> {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      return Promise.resolve([]);
    }
    const apiUrl = this.platformState.appApiBase;
    const url = new URL(`${apiUrl}/messages`);
    console.log('request messages', this.getState().conversations, conversation)
    url.search = new URLSearchParams({
      conversation_id: conversationId,
    }).toString();
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('messages success', data);
    const pairedMessages: LearnChatMessage[] = [];
    for (let i = 0; i < data.items.length; i += 2) {
      const userMessage = data.items[i];
      const teacherMessage = data.items[i + 1];
      const learnChatMessage: LearnChatMessage = {
        conversation: conversation,
        position: userMessage.position,
        userMessage: userMessage.content,
        teacherMessage: teacherMessage?.content,
        learningPhrases: teacherMessage?.learning_phrases,
      };
      pairedMessages.push(learnChatMessage);
    };
    return pairedMessages;
  }

  public async deleteMessages(conversationId: string, position: number): Promise<boolean> {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      console.error('Cannot deleteMessages as conversation is not found:', conversationId);
      return false;
    }

    const apiUrl = this.platformState.appApiBase;
    const url = `${apiUrl}/delete-messages`;
    const requestBody = {
      conversation_id: conversationId,
      position: position.toString(),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return false;
      }

      const data = await response.json();

      if (data.status === 'ok') {
        console.log('delete messages success');
        this.updateStateFrom(state => ({
          messages: state.messages.filter(message => message.position < position),
        }));
        return true;
      } else {
        console.log(`Error deleting messages: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting messages:', error);
    } finally {
      return false;
    }
  }

  private closeSend(errorReason?: string): void {
    this.eventSource?.close();
    this.eventSource = undefined;
    this.updateState({
      isThinking: false,
      errorReason: errorReason,
    });
  }
}

export default WebLanguageCoach;
