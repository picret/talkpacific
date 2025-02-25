import { PlatformState } from '../platform/PlatformContext';
import { ISO_639_1, ISO_639_3, Language, availableLanguages } from '../languagecoach/Languages';
import { TextToAudio, TextToAudioOptions, TextToAudioVoice } from './TextToAudio';

function getLanguages(voice: SpeechSynthesisVoice): Language[] {
  const code = voice.lang.split('-')[0];
  const isCodeInISO_639_1 = Object.values(ISO_639_1).includes(code as any);
  if (isCodeInISO_639_1) {
    return availableLanguages.filter((language) => language.iso1Code === code);
  }

  const isCodeInISO_639_3 = Object.values(ISO_639_3).includes(code as any);
  if (isCodeInISO_639_3) {
    return availableLanguages.filter((language) => language.includes.includes(code as ISO_639_3));
  }
  return [];
}

class WebVoice extends TextToAudioVoice {
  speechSynthesisVoice: SpeechSynthesisVoice;
  constructor(voice: SpeechSynthesisVoice) {
    super(
      voice.name,
      voice.localService,
      getLanguages(voice)
    );
    this.speechSynthesisVoice = voice;
  }
}

class WebTextToAudio extends TextToAudio {
  private speechSynthesis: SpeechSynthesis;
  
  constructor(_: PlatformState) {
    super();
    this.speechSynthesis = window.speechSynthesis;
    this.updateAvailableVoices();
    this.speechSynthesis.onvoiceschanged = () => this.updateAvailableVoices();
  }

  private updateAvailableVoices() {
    const voices = this.speechSynthesis.getVoices();
    const availableVoices = voices.map((voice) => new WebVoice(voice));
    this.updateState({ availableVoices });
  }

  predictText() {
    const options = this.getOptions()
    const languageCode = options.utteranceLanguage?.iso1Code;
    if (!languageCode) {
      console.error("No language code")
      return;
    }
    let voice: TextToAudioVoice | undefined = options.voice;
    if (!voice) {
      this.updateAvailableVoices();
      voice = this.getState().availableVoices.find((voice) =>
        voice.languages.find((language) => language.iso1Code === languageCode)
      );
      console.log(this.getState().availableVoices.filter((voice) => voice.languages.find((language) => language.iso1Code === languageCode)))
      console.warn("No voice provided, using default", voice)
    }
    if (!voice) {
      console.error("No voice for language", languageCode, options.utteranceLanguage)
      return;
    }
    const inputText = options.inputText;
    if (!inputText) {
      console.error("No input text")
      return;
    }
    const webVoice = voice as WebVoice;
    const utterance = this.createUtterance(options);
    utterance.lang = webVoice.speechSynthesisVoice.lang;
    utterance.pitch = options.utterancePitch;
    utterance.rate = options.utteranceRate;
    utterance.text = inputText;
    utterance.voice = webVoice.speechSynthesisVoice;
    utterance.volume = 1;
    this.speechSynthesis.speak(utterance);
  }

  private createUtterance(options: TextToAudioOptions): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(options.inputText);
    utterance.onpause = () => {
      this.updateState({ isPredicting: false });
    }
    utterance.onresume = () => {
      this.updateState({ isPredicting: true });
    }
    utterance.onend = () => {
      this.updateState({ isPredicting: false });
    }
    return utterance;
  }
}

export default WebTextToAudio;
