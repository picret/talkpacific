import { SpeechToText } from './SpeechToText';

class WebSpeechToText extends SpeechToText {
  private recognition?: SpeechRecognition;
  private mediaRecorder?: MediaRecorder;
  private recordedChunks: Blob[] = [];
  private audioStream?: MediaStream;

  constructor() {
    super();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser.");
      return;
    }
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;

    this.recognition.onstart = () => {
      console.log("Speech recognition started");
    }
    this.recognition.onend = () => {
      console.log("Speech recognition ended");
    }
    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    }
  }

  onStartListening(): void {
    console.log("onStartListening");
    if (!this.recognition) {
      console.error("Speech recognition not available");
      return;
    }
    this.recognition.abort();
    this.updateState({ isListening: true });
    const expectedLanguage = this.getOptions().language;
    if (expectedLanguage) {
      this.recognition.lang = expectedLanguage.iso1Code;
      console.log("Set language to", expectedLanguage.iso1Code);
    }
    this.recognition.start();
    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      console.log("Transcript:", transcript, event);
      this.updateState({ outputText: transcript });
    };
    if (this.getOptions().enableRecording) {
      this.onStartRecording()
    }
  }

  onStopListening(): void {
    console.log("onStopListening");
    if (!this.recognition) {
      console.error("Speech recognition not available");
      return;
    }
    this.recognition.stop();
    this.recognition.abort();
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.audioStream?.getTracks().forEach(track => track.stop());
      this.mediaRecorder = undefined;
      this.audioStream = undefined;
    }
    this.updateState({ isListening: false });
    this.onStopRecording();
  }

  private onStartRecording() {
    console.log("onStartRecording");
    if (!navigator.mediaDevices) {
      console.error("No media devices");
      return;
    }
    console.log(navigator)
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.audioStream = stream;
        this.mediaRecorder = new MediaRecorder(stream);
        this.recordedChunks = [];
        this.mediaRecorder.ondataavailable = (e) => this.recordedChunks.push(e.data);
        this.mediaRecorder.onstop = () => {
          const recordedAudio = new Blob(this.recordedChunks, { type: 'audio/webm' });
          const inputAudioUrl = URL.createObjectURL(recordedAudio);
          console.log("Recorded audio URL:", inputAudioUrl);
          this.updateState({ inputAudioUrl: inputAudioUrl });
        };
        this.mediaRecorder.start();
      })
      .catch(error => console.error("Error accessing microphone for recording:", error));
  }

  private onStopRecording() {
    console.log("onStopRecording");
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = undefined;
      }
    }
    this.updateState({ isListening: false });
  }
}

export default WebSpeechToText;
