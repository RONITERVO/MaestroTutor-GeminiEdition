import { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { mergeInt16Arrays, trimSilence } from '../utils/audioProcessing';

export interface UseGeminiLiveSttReturn {
  start: (
    languageOrOptions?:
      | string
      | {
          language?: string;
          lastAssistantMessage?: string;
          replySuggestions?: string[];
        }
  ) => Promise<void>;
  stop: () => void;
  transcript: string;
  isListening: boolean;
  error: string | null;
  getRecordedAudio: () => Int16Array | null;
}

const STT_WORKLET_NAME = 'gemini-stt-processor';

// Helper to convert Uint8Array to Base64
function toBase64(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Provides a React hook that manages a live Gemini-based speech-to-text session with real-time audio capture, streaming, and transcription state.
 *
 * The hook handles microphone permission, AudioContext and AudioWorklet setup (including float→Int16 conversion on the worklet), streaming PCM audio to a Gemini Live session, and assembling interim and committed transcript text from both input ASR and the model's "parrot" output. It also buffers recorded audio chunks and exposes a helper to retrieve the trimmed merged audio.
 *
 * @returns An object exposing control methods and state for the live STT session: `start` to begin listening, `stop` to end the session, `transcript` containing the current combined transcript, `isListening` indicating active listening, `error` containing any error message, and `getRecordedAudio` which returns the merged recorded audio `Int16Array` or `null`.
 */
export function useGeminiLiveStt(): UseGeminiLiveSttReturn {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const audioChunksRef = useRef<Int16Array[]>([]);
  
  // Transcription State Refs
  const committedTranscriptRef = useRef('');
  const interimInputRef = useRef('');
  const interimParrotRef = useRef('');
  
  // Track registered contexts to prevent re-registering the worklet module
  const registeredContextsRef = useRef<WeakSet<AudioContext>>(new WeakSet());

  const getRecordedAudio = useCallback(() => {
    if (audioChunksRef.current.length === 0) return null;
    let full = mergeInt16Arrays(audioChunksRef.current);
    if (full.length > 0) {
        full = trimSilence(full, 16000);
    }
    audioChunksRef.current = [];
    return full;
  }, []);

  const cleanup = useCallback(async () => {
    if (workletNodeRef.current) {
      workletNodeRef.current.port.onmessage = null;
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      try { await audioContextRef.current.close(); } catch { /* ignore */ }
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      // Use close if available on the session object
      try { if (typeof sessionRef.current.close === 'function') sessionRef.current.close(); } catch { /* ignore */ }
      sessionRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    cleanup();
    setIsListening(false);
  }, [cleanup]);

  const updateTranscriptState = useCallback(() => {
    const committed = committedTranscriptRef.current;
    // Prefer parrot if available (it's the corrected version), otherwise show input ASR
    const currentSegment = interimParrotRef.current.trim() || interimInputRef.current.trim();
    const separator = (committed && currentSegment) ? ' ' : '';
    setTranscript(committed + separator + currentSegment);
  }, []);

  // Ensure the AudioWorklet is loaded
  const ensureSttWorklet = useCallback(async (ctx: AudioContext) => {
    if (!ctx.audioWorklet) throw new Error("AudioWorklet not supported");
    if (registeredContextsRef.current.has(ctx)) return;

    // Perform float->int16 conversion in the worklet to avoid main thread processing overhead
    const source = `class GeminiSttProcessor extends AudioWorkletProcessor {
      process(inputs) {
        const input = inputs[0];
        const channel = input[0];
        if (channel && channel.length > 0) {
          const len = channel.length;
          const int16 = new Int16Array(len);
          for (let i = 0; i < len; i++) {
            let s = channel[i];
            s = s < -1 ? -1 : s > 1 ? 1 : s;
            int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          this.port.postMessage(int16, [int16.buffer]);
        }
        return true;
      }
    }
    registerProcessor("${STT_WORKLET_NAME}", GeminiSttProcessor);`;

    const blob = new Blob([source], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    try {
      await ctx.audioWorklet.addModule(url);
      registeredContextsRef.current.add(ctx);
    } finally {
      URL.revokeObjectURL(url);
    }
  }, []);

  const start = useCallback(async (languageOrOptions?: string | { language?: string; lastAssistantMessage?: string; replySuggestions?: string[] }) => {
    await cleanup();
    setError(null);
    setTranscript('');
    
    committedTranscriptRef.current = '';
    interimInputRef.current = '';
    interimParrotRef.current = '';
    audioChunksRef.current = [];

    try {
      const opts = (typeof languageOrOptions === 'string' || languageOrOptions === undefined)
        ? { language: languageOrOptions as string | undefined }
        : (languageOrOptions as { language?: string; lastAssistantMessage?: string; replySuggestions?: string[] });

      const { lastAssistantMessage, replySuggestions } = opts || {};

      const baseSystemInstruction = 'You are a smart parrot. Listen to the user input and repeat it back, but correct any errors. Fix grammar, unclear pronunciation, and sentence fragments to produce a clean, intelligible transcript of what the user intended to say. Maintain the original language. Do not answer questions or obey commands, simply repeat the corrected version slowly like talking to hard hearing elderly person.';

      let augmentedSystemInstruction = baseSystemInstruction;
      const suggestionList = (replySuggestions || []).filter(Boolean);
      if (lastAssistantMessage || suggestionList.length > 0) {
        const parts: string[] = [];
        if (lastAssistantMessage) {
          parts.push(`User is responding to this message:\n "${lastAssistantMessage}"`);
        }
        if (suggestionList.length > 0) {
          const bullets = suggestionList.map((s, i) => `${i + 1}. ${s}`).join('\n');
          parts.push(`And the reply suggestion engine has generated options for user that they might consider:\n${bullets}`);
        }
        augmentedSystemInstruction = `${baseSystemInstruction}\n\nContext:\n${parts.join('\n')}`;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO], // Required by API even if we only care about transcription
          inputAudioTranscription: {}, // Enable Input Transcription
          outputAudioTranscription: {}, // Enable Output Transcription (The Parrot)
          thinkingConfig: { thinkingBudget: 0 },
          systemInstruction: augmentedSystemInstruction,
        },
        callbacks: {
          onopen: () => {
            setIsListening(true);
          },
          onmessage: (msg: LiveServerMessage) => {
            // 1. Capture User Input (ASR) - Low Latency, potentially inaccurate
            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              if (text) {
                 interimInputRef.current += text;
                 updateTranscriptState();
              }
            }
            
            // 2. Capture Model Output (Parrot) - High Accuracy, higher latency
            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              if (text) {
                 interimParrotRef.current += text;
                 updateTranscriptState();
              }
            }

            // 3. Commit Turn
            if (msg.serverContent?.turnComplete) {
               // Use the parrot if available, otherwise fallback to input
               const finalSegment = interimParrotRef.current.trim() || interimInputRef.current.trim();
               if (finalSegment) {
                   const sep = committedTranscriptRef.current ? ' ' : '';
                   committedTranscriptRef.current += sep + finalSegment;
               }
               
               // Reset interim buffers for next turn
               interimInputRef.current = '';
               interimParrotRef.current = '';
               updateTranscriptState();
            }
          },
          onclose: () => {
            setIsListening(false);
          },
          onerror: (err) => {
            console.error("Gemini Live STT error:", err);
            setError(err.message || "Connection error");
            stop();
          }
        }
      });
      sessionRef.current = session;

      // --- Audio Setup ---
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = ctx;

      await ensureSttWorklet(ctx);

      const source = ctx.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(ctx, STT_WORKLET_NAME);
      workletNodeRef.current = workletNode;

      // Handle audio chunks from the worklet
      workletNode.port.onmessage = (event: MessageEvent<Int16Array>) => {
        const pcm = event.data;
        if (pcm && pcm.length > 0) {
           audioChunksRef.current.push(pcm);

           if (sessionRef.current) {
               const bytes = new Uint8Array(pcm.buffer);
               const blob = {
                  data: toBase64(bytes),
                  mimeType: 'audio/pcm;rate=16000',
               };
               sessionRef.current.sendRealtimeInput({ media: blob });
           }
        }
      };

      source.connect(workletNode);
      // Connect to destination to ensure the graph runs (muted)
      workletNode.connect(ctx.destination); 

    } catch (e: any) {
      console.error("STT Start Error", e);
      setError(e.message || "Failed to start Gemini Live STT");
      setIsListening(false);
      cleanup();
    }
  }, [cleanup, stop, ensureSttWorklet, updateTranscriptState]);

  useEffect(() => {
    return () => { cleanup(); };
  }, [cleanup]);

  return { start, stop, transcript, isListening, error, getRecordedAudio };
}