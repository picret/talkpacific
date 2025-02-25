import { BaseService, BaseEntity } from "../base/BaseService";
import { Language } from "../languagecoach/Languages";

export class TextToAudioOptions extends BaseEntity {
  inputText?: string;
  voice?: TextToAudioVoice;
  utteranceLanguage?: Language;
  utteranceRate: number = 1.0;
  utterancePitch: number = 1.0;
  utteranceVolume?: number;

  constructor(options?: Partial<TextToAudioOptions>) {
    super();
    Object.assign(this, options);
  }
}

export class TextToAudioState extends BaseEntity {
  isPredicting: boolean = false;
  outputLanguage?: string;
  outputText?: string;
  availableVoices: TextToAudioVoice[] = [];

  constructor(options?: Partial<TextToAudioOptions>) {
    super();
    Object.assign(this, options);
  }
}

export abstract class TextToAudioVoice extends BaseEntity {
  name: string;
  isLocal: boolean;
  languages: Language[];

  constructor(name: string, isLocal: boolean, languages: Language[]) {
    super();
    this.name = name;
    this.isLocal = isLocal;
    this.languages = languages;
  }
}

export abstract class TextToAudio extends BaseService<TextToAudioOptions, TextToAudioState> {

  constructor() {
    super(new TextToAudioOptions(), new TextToAudioState());
  }

  abstract predictText(): void
}
