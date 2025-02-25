import { useLearningContext } from '../learningpage/LearningContext';
import useTextToAudio from './useTextToAudio';

const TextToAudioComponent = () => {
  const { textToAudio } = useLearningContext();
  const { state, options } = useTextToAudio(textToAudio);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (state) {
      textToAudio?.updateOptions({ inputText: event.target.value });
    }
  };

  const predictText = () => {
    textToAudio?.predictText();
  };

  return (
    <div className="container">
      <button onClick={predictText} disabled={state?.isPredicting}>
        {state?.isPredicting ? 'Predicting...' : 'Translate Text'}
      </button>
      <textarea
        value={options?.inputText}
        onChange={handleInputChange}
      />
      {state?.outputText && (
        <p>Translation: {state.outputText}</p>
      )}
    </div>
  );
};

export default TextToAudioComponent;
