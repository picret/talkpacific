import { BaseEntity, BaseService } from "../base/BaseService";
import { Language } from "./Languages";

export type CreateConversationOptions = {
  primary: Language;
  learning: Language;
}

export type Conversation = {
  conversation_id: string;
  primary: Language;
  learning: Language;
};

export type LearnChatMessage = {
  conversation: Conversation;
  position: number;
  userMessage: string;
  teacherMessage?: string;
  isFinished?: boolean;
  finishedReason?: string;
  learningPhrases?: string[];
};

export class LanguageCoachOptions extends BaseEntity {
  inputText?: string;

  constructor(
    inputText?: string,
  ) {
    super();
    this.inputText = inputText;
  }
}

export class LanguageCoachState extends BaseEntity {
  isThinking: boolean;
  conversation?: Conversation;
  conversations: Conversation[];
  messages: LearnChatMessage[];
  errorReason?: string;

  constructor(
    isThinking: boolean = false,
    conversation?: Conversation,
    conversations: Conversation[] = [],
    messages: LearnChatMessage[] = [],
    errorReason?: string,
  ) {
    super();
    this.isThinking = isThinking;
    this.conversation = conversation;
    this.conversations = conversations;
    this.messages = messages;
    this.errorReason = errorReason;
  }
}

export abstract class LanguageCoach extends BaseService<LanguageCoachOptions, LanguageCoachState> {

  constructor() {
    super(new LanguageCoachOptions(), new LanguageCoachState());
  }

  public abstract send(): Promise<boolean>;
  public abstract createConversation(options: CreateConversationOptions): Promise<Conversation | undefined>;
  public abstract loadConversations(): Promise<Conversation[]>;
  public abstract deleteConversation(conversationId: string): Promise<boolean>;
  protected abstract loadMessages(conversationId: string): Promise<LearnChatMessage[]>;
  public abstract deleteMessages(conversationd: string, position: number): Promise<boolean>;

  public getConversation = (conversation_id: string | undefined): Conversation | undefined => {
    return this.getState().conversations.find((convo) => convo.conversation_id === conversation_id);
  }

  public setConversation = (conversation_id: string | undefined) => {
    console.log('setConversation', conversation_id);
    const conversation = this.getConversation(conversation_id);
    if (!conversation_id || conversation === undefined) {
      this.updateState({
        conversation: undefined,
        messages: [],
      });
      return;
    }
    if (conversation_id !== this.getState().conversation?.conversation_id) {
      this.updateState({
        conversation: conversation,
        messages: [],
      });
      console.log('load messages')
      let messages = this.loadMessages(conversation_id);
      messages.then((messages) => {
        this.updateState({ messages: messages });
      });
    }
  }
}
