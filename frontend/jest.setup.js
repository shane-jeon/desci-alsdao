// Learn more: https://github.com/testing-library/jest-dom
require("@testing-library/jest-dom");

// Mock fetch globally
global.fetch = jest.fn(() => Promise.resolve());

beforeEach(() => {
  jest.clearAllMocks();
});
