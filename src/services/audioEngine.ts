/**
 * Priya Audio Engine
 * Handles Web Audio API capture (16kHz PCM), output playback (24kHz / WAV),
 * real-time frequency analysis for HUD visualizers, speech recognition,
 * and immediate interrupt handling.
 */

export interface VisualizerData {
  volume: number; // 0 to 1
  frequencies: number[]; // Array of normalized frequency values
}

export class PriyaAudioEngine {
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyserNode: AnalyserNode | null = null;
  private currentAudioSource: AudioBufferSourceNode | null = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private recognition: any = null;
  private onWakeWordDetected?: () => void;
  private onSpeechTranscript?: (transcript: string) => void;
  private onVisualizerUpdate?: (data: VisualizerData) => void;
  private animationFrameId: number | null = null;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-IN'; // Indian English / Hindi mix

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const combined = (finalTranscript || interimTranscript).toLowerCase().trim();

          // Interruption detection: if Priya is speaking and user speaks, stop playback immediately!
          if (this.isSpeaking && combined.length > 2) {
            console.log('Interruption detected: user spoken while Priya was speaking');
            this.stopPlayback();
          }

          // Check wake word "Hey Priya" or "Priya"
          if (
            combined.includes('hey priya') ||
            combined.includes('priya') ||
            combined.includes('he priya') ||
            combined.includes('hi priya')
          ) {
            if (this.onWakeWordDetected) {
              this.onWakeWordDetected();
            }
          }

          if (finalTranscript && this.onSpeechTranscript) {
            this.onSpeechTranscript(finalTranscript.trim());
          }
        };

        this.recognition.onerror = (e: any) => {
          if (e.error !== 'no-speech') {
            console.warn('Speech recognition error:', e.error);
          }
        };

        this.recognition.onend = () => {
          // Keep listening for wake word if active
          if (this.isListening && this.recognition) {
            try {
              this.recognition.start();
            } catch {
              // Ignore restart error
            }
          }
        };
      } catch (e) {
        console.warn('SpeechRecognition initialization note:', e);
      }
    }
  }

  public setCallbacks(callbacks: {
    onWakeWord?: () => void;
    onTranscript?: (text: string) => void;
    onVisualizer?: (data: VisualizerData) => void;
  }) {
    if (callbacks.onWakeWord) this.onWakeWordDetected = callbacks.onWakeWord;
    if (callbacks.onTranscript) this.onSpeechTranscript = callbacks.onTranscript;
    if (callbacks.onVisualizer) this.onVisualizerUpdate = callbacks.onVisualizer;
  }

  // Start continuous audio capture & visualizer
  public async startMicrophone(): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioContextClass({ sampleRate: 16000 });
      if (this.inputAudioCtx.state === 'suspended') {
        await this.inputAudioCtx.resume();
      }

      const source = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.inputAudioCtx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.analyserNode.smoothingTimeConstant = 0.8;
      source.connect(this.analyserNode);

      this.isListening = true;

      if (this.recognition) {
        try {
          this.recognition.start();
        } catch {
          // Already running
        }
      }

      this.startVisualizerLoop();
      return true;
    } catch (err) {
      console.error('Failed to start microphone:', err);
      return false;
    }
  }

  public stopMicrophone() {
    this.isListening = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignored
      }
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.inputAudioCtx) {
      this.inputAudioCtx.close();
      this.inputAudioCtx = null;
    }
  }

  private startVisualizerLoop() {
    const dataArray = new Uint8Array(32);

    const update = () => {
      if (this.analyserNode) {
        this.analyserNode.getByteFrequencyData(dataArray);

        let sum = 0;
        const normalized: number[] = [];
        for (let i = 0; i < 16; i++) {
          const val = dataArray[i] / 255;
          normalized.push(val);
          sum += val;
        }

        const avgVolume = sum / 16;
        if (this.onVisualizerUpdate) {
          this.onVisualizerUpdate({
            volume: avgVolume,
            frequencies: normalized,
          });
        }
      }

      this.animationFrameId = requestAnimationFrame(update);
    };

    update();
  }

  // Play audio buffer from base64 WAV or PCM
  public async playAudioBase64(base64Data: string): Promise<void> {
    try {
      this.stopPlayback(); // stop any previous playback
      this.isSpeaking = true;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.outputAudioCtx) {
        this.outputAudioCtx = new AudioContextClass({ sampleRate: 24000 });
      }
      if (this.outputAudioCtx.state === 'suspended') {
        await this.outputAudioCtx.resume();
      }

      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio
      const audioBuffer = await this.outputAudioCtx.decodeAudioData(bytes.buffer);
      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = audioBuffer;

      // Connect to destination and analyzer
      source.connect(this.outputAudioCtx.destination);
      this.currentAudioSource = source;

      source.onended = () => {
        this.isSpeaking = false;
        this.currentAudioSource = null;
      };

      source.start(0);
    } catch (err) {
      console.warn('Audio playback error, falling back to Web Speech synthesis:', err);
      this.isSpeaking = false;
    }
  }

  // Stop playback immediately on interruption
  public stopPlayback() {
    if (this.currentAudioSource) {
      try {
        this.currentAudioSource.stop();
        this.currentAudioSource.disconnect();
      } catch {
        // Ignored
      }
      this.currentAudioSource = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  // Fallback speech synthesis when Gemini TTS is offline or unavailable
  public speakFallback(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }
      this.stopPlayback();
      this.isSpeaking = true;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.1;
      utterance.rate = 1.0;

      // Select female voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.lang.includes('IN') && v.name.toLowerCase().includes('female')) ||
        voices.find((v) => v.name.toLowerCase().includes('female')) ||
        voices[0];

      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public getPlaybackState(): boolean {
    return this.isSpeaking;
  }
}

export const audioEngineInstance = new PriyaAudioEngine();
