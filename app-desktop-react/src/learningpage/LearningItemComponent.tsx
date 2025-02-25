import React from 'react';
import { Typography } from 'antd';
import { LearnChatMessage } from '../languagecoach/LanguageCoach';
import { useLearningContext } from './LearningContext';

const { Link } = Typography;

const LearningItemComponent = ({ item }: { item: LearnChatMessage }) => {
  const { languageCoach, textToAudio } = useLearningContext();

  const onPhraseClick = (phrase: any) => {
    textToAudio?.updateOptions({
      inputText: phrase,
      utteranceLanguage: languageCoach?.getState()?.conversation?.learning,
    });
    textToAudio?.predictText();
  };

  const renderTextLines = () => {
    return item.teacherMessage?.split('\n').map((line: any, index: any) => {
      const segments = [];
      let remainingText: string = line;
      item.learningPhrases?.forEach((phrase: string) => {
        const phraseIndex = remainingText.indexOf(phrase);
        if (phraseIndex !== -1) {
          if (phraseIndex > 0) {
            segments.push(remainingText.substring(0, phraseIndex));
          }
          segments.push(
            <Link
              href="#"
              onClick={() => onPhraseClick(phrase)}
              style={{ color: 'blue' }}
              key={`phrase-${phrase}-${index}-${phraseIndex}`}
            >
              {phrase}
            </Link>
          );
          remainingText = remainingText.substring(phraseIndex + phrase.length);
        }
      });

      if (remainingText) {
        segments.push(remainingText);
      }
      return (
        <React.Fragment key={`line-${index}`}>
          {segments}
          <br />
        </React.Fragment>
      );
    });
  };

  return (
    <div>
      {renderTextLines()}
    </div>
  );
};

export default LearningItemComponent;
