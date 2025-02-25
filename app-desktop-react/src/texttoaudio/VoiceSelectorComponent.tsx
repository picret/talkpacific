import { useEffect, useMemo } from 'react';
import { Select, Slider, Row, Col } from 'antd';
import useTextToAudio from './useTextToAudio';
import { TextToAudioVoice } from './TextToAudio';
import { useLearningContext } from '../learningpage/LearningContext';
import { Language } from '../languagecoach/Languages';

const VoiceSelectorComponent = ({ language }: { language: Language }) => {
  const { textToAudio } = useLearningContext();
  const { options, state } = useTextToAudio(textToAudio)
  const availableVoices = useMemo(() => {
    return state.availableVoices.filter((voice: TextToAudioVoice) => {
      return voice.languages.includes(language);
    })
  }, [language, state.availableVoices]);

  useEffect(() => {
    if (!options.voice && availableVoices.length > 0) {
      textToAudio?.updateOptions({ voice: availableVoices[0] });
    }
  }, [availableVoices, options.voice, textToAudio]);

  return (
    <div>
      <Select
        style={{ width: 200 }}
        placeholder="Select a voice"
        value={options.voice?.name || undefined}
        onChange={(value) => {
          const voice = availableVoices.find((voice: TextToAudioVoice) => voice.name === value);
          textToAudio?.updateOptions({ voice: voice })
        }
        }
      >
        {availableVoices.map(voice => (
          <Select.Option key={voice.name} value={voice.name}>{voice.name}</Select.Option>
        ))}
      </Select>

      <Row style={{ marginTop: 16 }}>
        <Col span={12}>
          <span>Utterance Rate: </span>
          <Slider
            min={0.5}
            max={2}
            step={0.1}
            value={options.utteranceRate}
            onChange={(value: number) => textToAudio?.updateOptions({ utteranceRate: value })}
          />
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={12}>
          <span>Utterance Pitch: </span>
          <Slider
            min={0.5}
            max={2}
            step={0.1}
            value={options.utterancePitch}
            onChange={(value: number) => textToAudio?.updateOptions({ utterancePitch: value })}
          />
        </Col>
      </Row>
    </div>
  );
};

export default VoiceSelectorComponent;
