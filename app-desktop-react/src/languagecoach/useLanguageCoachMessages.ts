// useLanguageCoachMessages.ts

import { useLearningContext } from '../learningpage/LearningContext';
import useService from '../base/useService';
import { Conversation, LanguageCoachOptions, LanguageCoachState } from './LanguageCoach';

class LanguageCoachMessages {
  private converstaion?: Conversation;

  constructor(converstaion?: Conversation) {
    this.converstaion = converstaion;
  }

  message(key: string): string {
    const conversation = this.converstaion;
    if (!conversation) {
      return `Message only available during a conversation ${key}`;
    }
    const primaryKey = conversation.primary.key;
    const learningKey = conversation.learning.key;
    const message = messages[key]?.[primaryKey]?.[learningKey] ?? null;
    if (message) {
      return message;
    }
    return `No message found for ${key} with ${primaryKey} learning ${learningKey}`;
  }
}

const useLanguageCoachMessages = () => {
  const learningContext = useLearningContext();
  const languageCoach = learningContext.languageCoach;
  const { state } = useService(
    languageCoach,
    new LanguageCoachOptions(),
    new LanguageCoachState(),
  );
  const conversation = state.conversation;
  return new LanguageCoachMessages(conversation);
};

const messages: Record<string, Record<string, Record<string, string>>> = {
  chatInputAreaPlaceholder: {
    english: {
      chinese: "早上好 (Zǎoshang hǎo), which is 'Good morning' - Start the day with a greeting!",
      spanish: "Try 'Where is the library?' or '¿Dónde está la biblioteca?' - Always handy for travelers!",
    },
    chinese: {
      english: "你好！让我们学习英语 (English)",
      spanish: "你好！让我们学习西班牙语 (Español)",
    },
    spanish: {
      english: "Hello! Aprendamos inglés (English)!",
      chinese: "¡Hola! Aprendamos chino (中文)!",
    },
  },
};

export default useLanguageCoachMessages;
