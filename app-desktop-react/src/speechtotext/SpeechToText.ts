import { BaseEntity, BaseService } from "../base/BaseService";
import { Language } from "../languagecoach/Languages";

const TIMER_INTERVAL_MILLISECONDS = 1000; 

export class SpeechToTextOptions extends BaseEntity {
  language?: Language;
  enableRecording: boolean;

  constructor(
    language: Language | undefined = undefined,
    enableRecording: boolean = true,
  ) {
    super();
    this.language = language;
    this.enableRecording = enableRecording;
  }
}

export class SpeechToTextState extends BaseEntity {
  isListening: boolean;
  inputAudioUrl?: string;
  outputText: string;
  elapsedTime: number;

  constructor(
    isListening: boolean = false,
    outputText: string = '',
    inputAudioUrl?: string,
    elapsedTime: number = 0,
  ) {
    super();
    this.isListening = isListening;
    this.outputText = outputText;
    this.inputAudioUrl = inputAudioUrl;
    this.elapsedTime = elapsedTime;
  }
}

export abstract class SpeechToText extends BaseService<SpeechToTextOptions, SpeechToTextState> {
  private intervalId?: NodeJS.Timeout;
  private startTime?: number;

  constructor() {
    super(new SpeechToTextOptions(), new SpeechToTextState());
  }

  /**
   * Start listening for speech input. If already listening, do nothing.
   * If you need to restart listening, call [stopListening] first.
   * You must call [stopListening] when you are done listening.
   */
  public startListening() {
    console.log("Starting listening", this.getState());
    if (this.getState().isListening) {
      return;
    }

    if (this.intervalId) {
      // This should never happen, but just in case there state issue
      // this will clear it.
      this.stopListening();
    }
    this.startTime = Date.now();
    this.updateState(new SpeechToTextState(true));
    this.intervalId = setInterval(() => {
      const elapsedTimeMillis = Date.now() - (this.startTime ?? Date.now());
      const elapsedTimeSeconds = parseFloat((elapsedTimeMillis / 1000).toFixed(2));
      this.updateState({ elapsedTime: elapsedTimeSeconds });
    }, TIMER_INTERVAL_MILLISECONDS);

    this.onStartListening();
  }

  /**
   * Stop listening for speech input. If not listening, do nothing.
   */
  public stopListening(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.updateState({ isListening: false });
    this.onStopListening();
  }

  protected abstract onStartListening(): void;

  protected abstract onStopListening(): void;
}
