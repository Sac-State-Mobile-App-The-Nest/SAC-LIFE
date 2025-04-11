jest.mock('expo-font', () => ({
    useFonts: jest.fn(() => [true]),  // Mocking the useFonts hook
  }));
  
  jest.mock('expo-modules-core', () => ({
    EventEmitter: { addListener: jest.fn(), removeListener: jest.fn() },
  }));