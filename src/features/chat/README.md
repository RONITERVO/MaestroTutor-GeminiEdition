# Chat Feature

The chat feature handles all messaging functionality in the Maestro Language Tutor.

## Responsibilities

- Chat message state management (CRUD operations)
- Reply suggestions generation and display
- Message history persistence via IndexedDB
- TTS audio caching for messages
- Bookmark-based history trimming

## Owned Store Slice

`chatSlice` - see `src/store/slices/chatSlice.ts`

### State
- `messages`: Array of chat messages
- `isLoadingHistory`: Loading state for history
- `replySuggestions`: Current reply suggestions
- `isLoadingSuggestions`: Loading state for suggestions
- `isSending`: Whether a message is being sent
- `sendPrep`: Preparation state for sending (media upload progress)
- `latestGroundingChunks`: Search grounding metadata
- `attachedImageBase64/attachedImageMimeType`: Attached media

### Key Actions
- `addMessage()`: Add a new message
- `updateMessage()`: Update an existing message
- `loadHistoryForPair()`: Load chat history for a language pair
- `upsertMessageTtsCache()`: Cache TTS audio for a message
- `upsertSuggestionTtsCache()`: Cache TTS audio for a suggestion

## Public API

Import from `src/features/chat/index.ts`:

```typescript
import { 
  ChatInterface,
  ChatMessageBubble,
  InputArea,
  getChatHistoryDB,
  safeSaveChatHistoryDB,
} from '../features/chat';
```

## Components

- `ChatInterface`: Main chat container
- `ChatMessageBubble`: Individual message display
- `InputArea`: Text input and controls
- `SuggestionsList`: Reply suggestions display
- `BookmarkActions`: Bookmark management
- `TextScrollwheel`: Text input helper

## Services

- `chatHistory.ts`: IndexedDB persistence for messages
- `persistence.ts`: TTS cache utilities

## Internal Dependencies

- Uses `store/slices/chatSlice` for state
- Uses `store/slices/settingsSlice` for settings access
