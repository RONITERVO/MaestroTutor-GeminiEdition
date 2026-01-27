/// <reference types="vite/client" />

// Type declarations for Vite's special import suffixes

// Worker imports with URL suffix
declare module '*?worker&url' {
  const url: string;
  export default url;
}

declare module '*?url' {
  const url: string;
  export default url;
}

// Worker imports (instantiated)
declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

// Worklet-specific module declarations
declare module '*.worklet.ts?worker&url' {
  const url: string;
  export default url;
}

declare module '*.worklet.js?worker&url' {
  const url: string;
  export default url;
}
