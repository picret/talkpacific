import React, { createContext, useContext, ReactNode } from 'react';
import { TextToAudio } from '../texttoaudio/TextToAudio';
import { SpeechToText } from '../speechtotext/SpeechToText';
import { LanguageCoach } from '../languagecoach/LanguageCoach';
import { createUseInstance } from '../base/InstanceFactory';
import WebSpeechToText from '../speechtotext/WebSpeechToText';
import ElectronSpeechToText from '../speechtotext/ElectronSpeechToText';
import WebLanguageCoach from '../languagecoach/WebLanguageCoach';
import WebTextToAudio from '../texttoaudio/WebTextToAudio';

export const createSpeechToText = createUseInstance<SpeechToText>({
  webClass: WebSpeechToText,
  desktopClass: ElectronSpeechToText
});

export const createTextToAudio = createUseInstance<TextToAudio>({
  webClass: WebTextToAudio,
});

export const createLanguageCoach = createUseInstance<LanguageCoach>({
  webClass: WebLanguageCoach,
});

export class LearningScope {
  speechToText: SpeechToText | null;
  textToSpeech: TextToAudio | null;
  languageCoach: LanguageCoach | null;

  constructor(
    speechToText: SpeechToText | null = null,
    textToSpeech: TextToAudio | null = null,
    languageCoach: LanguageCoach | null = null,
  ) {
    this.speechToText = speechToText;
    this.textToSpeech = textToSpeech;
    this.languageCoach = languageCoach;
  }
}
interface LearningContextType {
  speechToText: SpeechToText | null;
  textToAudio: TextToAudio | null;
  languageCoach: LanguageCoach | null;
}

export const LearningContext = createContext<LearningContextType>({
  speechToText: null,
  textToAudio: null,
  languageCoach: null,
});

interface LearningProviderProps {
  children: ReactNode;
}

export const LearningProvider: React.FC<LearningProviderProps> = ({ children }) => {
  const speechToText = createSpeechToText();
  const textToAudio = createTextToAudio();
  const languageCoach = createLanguageCoach();

  const value: LearningContextType = {
    speechToText: speechToText,
    textToAudio: textToAudio,
    languageCoach: languageCoach,
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearningContext = () => useContext(LearningContext);
