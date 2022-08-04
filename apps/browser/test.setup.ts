// Add chrome storage api
const QUOTA_BYTES = 10;
global.chrome = {
  storage: {
    local: {
      set: jest.fn(),
      get: jest.fn(),
      remove: jest.fn(),
      QUOTA_BYTES,
      getBytesInUse: jest.fn(),
      clear: jest.fn(),
    },
    session: {
      set: jest.fn(),
      get: jest.fn(),
      has: jest.fn(),
      remove: jest.fn(),
    },
  },
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    sendMessage: jest.fn(),
    getManifest: jest.fn(),
  },
} as any;
