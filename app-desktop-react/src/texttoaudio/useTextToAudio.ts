import { useState, useEffect, useCallback } from 'react';
import {
  TextToAudio,
  TextToAudioOptions,
  TextToAudioState
} from './TextToAudio';
import { Observer } from '../base/BaseService';

type TextToAudioHook = {
  options: TextToAudioOptions;
  state: TextToAudioState;
  updateOptions: (overrides: Partial<TextToAudioOptions>) => void;
};

const useTextToAudio = (textToAudio: TextToAudio | null): TextToAudioHook => {
  const [options, setOptions] = useState<TextToAudioOptions>(new TextToAudioOptions());
  const [state, setState] = useState<TextToAudioState>(new TextToAudioState());

  useEffect(() => {
    if (!textToAudio) return;

    const observer: Observer<TextToAudioOptions, TextToAudioState> = {
      onOptionsChange: setOptions,
      onStateChange: setState,
    };

    textToAudio.subscribe(observer);
    return () => {
      textToAudio.unsubscribe(observer);
    };
  }, [textToAudio]);

  const updateOptions = useCallback((overrides: Partial<TextToAudioOptions>) => {
    if (!textToAudio) return;
    textToAudio.updateOptions(overrides);
  }, [textToAudio]);

  return { options, state, updateOptions };
};

export default useTextToAudio;
