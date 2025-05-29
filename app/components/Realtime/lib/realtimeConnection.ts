import { RefObject } from "react";
import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';

interface GeminiConnectionConfig {
  apiKey: string;
  model: string;
  systemInstruction: string;
  responseModalities: string[];
  speechConfig?: any;
}

export async function createGeminiConnection(
  config: GeminiConnectionConfig,
  audioElement: RefObject<HTMLAudioElement | null>,
  onMessage: (message: any) => void,
  onError: (error: any) => void
): Promise<{ session: Session; mediaStream: MediaStream }> {
  const ai = new GoogleGenAI({ apiKey: config.apiKey });

  // Get user media for audio input
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      sampleRate: 16000,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true
    }
  });

  // Create session with Gemini Live API
  const session = await ai.live.connect({
    model: config.model,
    callbacks: {
      onopen: function () {
        console.debug('Gemini session opened');
        // Audio input will be handled via text for now
        // TODO: Implement proper audio input processing
      },
      onmessage: function (message: LiveServerMessage) {
        handleGeminiMessage(message, audioElement, onMessage);
      },
      onerror: function (e: ErrorEvent) {
        console.debug('Gemini error:', e.message);
        onError(e);
      },
      onclose: function (e: CloseEvent) {
        console.debug('Gemini session closed:', e.reason);
      },
    },
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction: {
        parts: [{ text: config.systemInstruction }]
      },
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: config.speechConfig?.voiceConfig?.prebuiltVoiceConfig?.voiceName || "Zephyr"
          }
        }
      }
    }
  });

  return { session, mediaStream };
}

// TODO: Implement audio input processing
// For now, audio input will be handled via text messages

// Audio buffer to collect audio chunks
let audioChunks: string[] = [];
let audioContext: AudioContext | null = null;

function handleGeminiMessage(
  message: LiveServerMessage,
  audioElement: RefObject<HTMLAudioElement | null>,
  onMessage: (message: any) => void
) {
  // Handle audio output
  if (message.serverContent?.modelTurn?.parts) {
    const part = message.serverContent.modelTurn.parts[0];

    if (part?.inlineData && part.inlineData.mimeType?.includes('audio')) {
      // Collect audio chunks
      const audioData = part.inlineData.data;
      if (audioData) {
        audioChunks.push(audioData);
      }
    }

    if (part?.text) {
      // Handle text responses
      onMessage({
        type: 'response.text',
        text: part.text
      });
    }
  }

  // Handle turn completion - play collected audio
  if (message.serverContent?.turnComplete && audioChunks.length > 0) {
    playAudioChunks(audioElement);
  }

  // Forward all messages to the handler
  onMessage({
    type: 'gemini.message',
    data: message
  });
}

async function playAudioChunks(audioElement: RefObject<HTMLAudioElement | null>) {
  if (!audioElement.current || audioChunks.length === 0) return;

  try {
    // Initialize audio context if needed
    if (!audioContext) {
      audioContext = new AudioContext({ sampleRate: 24000 });
    }

    // Combine all audio chunks
    const combinedAudio = audioChunks.join('');

    // Convert base64 to ArrayBuffer
    const binaryString = atob(combinedAudio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create WAV header for 24kHz, 16-bit, mono PCM
    const wavHeader = createWavHeader(bytes.length);
    const wavData = new Uint8Array(wavHeader.length + bytes.length);
    wavData.set(wavHeader, 0);
    wavData.set(bytes, wavHeader.length);

    // Create blob and play
    const audioBlob = new Blob([wavData], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Stop current audio if playing
    if (!audioElement.current.paused) {
      audioElement.current.pause();
    }

    audioElement.current.src = audioUrl;

    // Play the audio
    await audioElement.current.play();

    // Clean up URL after playing
    audioElement.current.addEventListener('ended', () => {
      URL.revokeObjectURL(audioUrl);
    }, { once: true });

  } catch (error) {
    console.error('Error playing audio:', error);
  } finally {
    // Clear audio chunks for next response
    audioChunks = [];
  }
}

function createWavHeader(dataLength: number): Uint8Array {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;

  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataLength, true); // File size
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Chunk size
  view.setUint16(20, 1, true); // Audio format (PCM)
  view.setUint16(22, numChannels, true); // Number of channels
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, byteRate, true); // Byte rate
  view.setUint16(32, blockAlign, true); // Block align
  view.setUint16(34, bitsPerSample, true); // Bits per sample

  // data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataLength, true); // Data size

  return new Uint8Array(header);
}

// Audio processing utilities for Gemini
export function convertAudioToPCM(audioBuffer: ArrayBuffer): string {
  const int16Array = new Int16Array(audioBuffer);
  return btoa(String.fromCharCode(...new Uint8Array(int16Array.buffer)));
}

export function sendAudioToGemini(session: Session, audioData: string) {
  session.sendRealtimeInput({
    audio: {
      data: audioData,
      mimeType: "audio/pcm;rate=16000"
    }
  });
}

// Keep the old function for backward compatibility during migration
export async function createRealtimeConnection(
  EPHEMERAL_KEY: string,
  audioElement: RefObject<HTMLAudioElement | null>
): Promise<{ pc: RTCPeerConnection; dc: RTCDataChannel }> {
  throw new Error("OpenAI realtime connection is deprecated. Use createGeminiConnection instead.");
}