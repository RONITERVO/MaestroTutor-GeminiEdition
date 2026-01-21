# Vision Feature

The vision feature handles camera access and image processing.

## Responsibilities

- Camera device enumeration
- Live video stream management
- Snapshot capture for visual context
- Image optimization for API calls
- Video keyframe extraction

## Owned Store Slice

`hardwareSlice` - see `src/store/slices/hardwareSlice.ts`

### State
- `availableCameras`: List of camera devices
- `currentCameraFacingMode`: 'user', 'environment', or 'unknown'
- `liveVideoStream`: Active MediaStream (non-serializable, transient)
- `visualContextStream`: Visual context MediaStream (non-serializable, transient)
- `visualContextCameraError`: Camera error message
- `snapshotUserError`: Snapshot error message
- `microphoneApiAvailable`: Whether microphone API is available
- `isCurrentlyPerformingVisualContextCapture`: Capture in progress

### Key Actions
- `setAvailableCameras()`: Update camera list
- `setLiveVideoStream()`: Set active stream
- `setVisualContextStream()`: Set visual context stream
- `cleanupStreams()`: Stop all streams

## Public API

Import from `src/features/vision/index.ts`:

```typescript
import { 
  processMediaForUpload,
  getFacingModeFromLabel,
  createKeyframeFromVideoDataUrl,
} from '../features/vision';
```

## Services

- `mediaOptimizationService.ts`: Image resizing and compression

## Utils

- `mediaUtils.ts`: Camera facing mode detection, video keyframe extraction

## Important Notes

### Non-Serializable State

`liveVideoStream` and `visualContextStream` are MediaStream objects which 
are non-serializable. These are marked as transient state and should 
NEVER be persisted. If store persistence middleware is added later, 
these fields must be explicitly excluded.

### Stream Lifecycle

Streams are managed by the `useHardware` hook which handles:
- Starting streams when features are enabled
- Stopping streams on cleanup/unmount
- Switching cameras when selection changes
