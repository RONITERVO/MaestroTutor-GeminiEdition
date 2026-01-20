# Diagnostics Feature

The diagnostics feature handles debugging and logging functionality.

## Responsibilities

- Debug log display panel
- Log capture and storage
- Developer diagnostics tools

## Owned Store Slice

`diagnosticsSlice` - see `src/store/slices/diagnosticsSlice.ts`

### State
- `showDebugLogs`: Whether debug panel is visible

### Key Actions
- `setShowDebugLogs()`: Show/hide debug panel
- `toggleDebugLogs()`: Toggle debug panel visibility

## Public API

Import from `src/features/diagnostics/index.ts`:

```typescript
import { 
  DebugLogPanel,
  debugLogService,
} from '../features/diagnostics';
```

## Components

- `DebugLogPanel`: Floating debug log viewer

## Services

- `debugLogService.ts`: Log capture and retrieval

## Usage

The debug panel can be toggled from the Header component.
Logs are captured throughout the app using `debugLogService.log()`.
