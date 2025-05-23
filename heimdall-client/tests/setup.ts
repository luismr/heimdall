// Global test setup
import 'jest';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to disable logging during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}; 