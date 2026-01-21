# Session Feature

The session feature handles language selection, settings, and reengagement functionality.

## Responsibilities

- Application settings management
- Language pair selection and persistence
- Smart reengagement system (idle detection, prompts)
- Global user profile management

## Owned Store Slices

### `settingsSlice` - see `src/store/slices/settingsSlice.ts`

#### State
- `settings`: AppSettings object (language pair, camera, TTS/STT config, etc.)
- `languagePairs`: Available language pair definitions
- `isSettingsLoaded`: Whether settings have been loaded from DB
- `needsLanguageSelection`: Whether user needs to select a language

#### Key Actions
- `initSettings()`: Load settings from DB
- `updateSetting()`: Update a single setting
- `setSettings()`: Replace all settings

### `reengagementSlice` - see `src/store/slices/reengagementSlice.ts`

#### State
- `reengagementPhase`: Current phase (idle, waiting, watching, countdown, engaging)
- `isUserActive`: Whether user is currently active
- `reengagementDeadline`: When countdown will trigger

#### Key Actions
- `setReengagementPhase()`: Update phase
- `markUserActive()`: Mark user as active (resets phase)

## Public API

Import from `src/features/session/index.ts`:

```typescript
import { 
  Header,
  LanguageSelectorGlobe,
  useSmartReengagement,
  getAppSettingsDB,
  setAppSettingsDB,
} from '../features/session';
```

## Components

- `Header`: App header with status display
- `LanguageSelectorGlobe`: Language selection trigger
- `LanguageScrollWheel`: Language picker
- `GlobalProfileSummary`: User profile display
- `CollapsedMaestroStatus`: Minimal Maestro status

## Hooks

- `useSmartReengagement`: Idle detection and reengagement logic

## Services

- `settings.ts`: IndexedDB persistence for settings
- `globalProfile.ts`: User profile persistence
