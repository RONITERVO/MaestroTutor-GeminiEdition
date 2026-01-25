# Speech Feature

The speech feature handles Text-to-Speech (TTS) and Speech-to-Text (STT) functionality.

## Responsibilities

- Gemini Live TTS playback (single TTS engine)
- Gemini Live STT integration
- Audio recording and playback
- Speech queue management

## Owned Store Slice

`speechSlice` - see `src/store/slices/speechSlice.ts`

### State
**STT:**
- `isListening`: Whether STT is active
- `transcript`: Current recognized text
- `sttError`: Any STT error message
- `isSpeechRecognitionSupported`: Microphone API availability
- `recordedUtterancePending`: Pending audio recording
- `sttInterruptedBySend`: Whether STT was interrupted by send

**TTS:**
- `isSpeaking`: Whether TTS is active
- `speakingUtteranceText`: Text currently being spoken
- `isSpeechSynthesisSupported`: Live TTS capability

### Key Actions
- `setIsListening()`: Update listening state
- `setTranscript()`: Update transcript
- `clearTranscript()`: Clear transcript
- `setIsSpeaking()`: Update speaking state
- `claimRecordedUtterance()`: Get pending recording

## Public API

Import from `src/features/speech/index.ts`:

```typescript
import { 
  SttLanguageSelector,
  useBrowserSpeech,
  useGeminiLiveConversation,
  pcmToWav,
} from '../features/speech';
```

## Components

- `SttLanguageSelector`: Language picker for STT

## Hooks

- `useBrowserSpeech`: Gemini STT wrapper (legacy name)
- `useTtsEngine`: TTS engine abstraction
- `useGeminiLiveConversation`: Gemini Live API
- `useGeminiLiveStt`: Gemini-based STT

## Utils

- `audioProcessing.ts`: PCM to WAV conversion, silence detection
- `audioUtils.ts`: Audio playback utilities

## Integration Notes

The speech slice manages observable state. Actual TTS/STT engine 
operations remain in the hooks (useBrowserSpeech, etc.) because they 
involve DOM APIs and event handlers that aren't suitable for pure state.
