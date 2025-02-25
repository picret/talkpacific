import { SpeechToText } from './SpeechToText';

class ElectronSpeechToText extends SpeechToText {
  isListening: () => boolean = () => false;

  onStartListening(): void {
    if (!this.isListening()) {
      this.updateState({
        outputText: "I'm supposed to be listening, but I'm not."
      })
    }
  }

  onStopListening(): void {
    if (!this.isListening()) {
      this.updateState({
        outputText: "I'm done never listening."
      })
    }
  }
}

export default ElectronSpeechToText;
