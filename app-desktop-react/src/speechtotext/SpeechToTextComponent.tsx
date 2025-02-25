import { Button } from 'antd';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import { SpeechToTextOptions, SpeechToTextState } from './SpeechToText';
import { useLearningContext } from '../learningpage/LearningContext';
import useService from '../base/useService';

const SpeechToTextComponent = () => {
  const { speechToText } = useLearningContext();
  const { state } = useService(
    speechToText,
    new SpeechToTextOptions(),
    new SpeechToTextState()
  );

  const toggleListening = () => {
    if (state?.isListening) {
      speechToText?.stopListening();
    } else {
      speechToText?.startListening();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={toggleListening}
        icon={state?.isListening ? <AudioMutedOutlined /> : <AudioOutlined />}>
        {state?.isListening ? formatTime(state.elapsedTime) : ""}
      </Button>
      {state?.outputText && (
        <p>Predicted: {state.outputText}</p>
      )}
      {state?.inputAudioUrl && (
        <div>
          <audio controls src={state.inputAudioUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default SpeechToTextComponent;
