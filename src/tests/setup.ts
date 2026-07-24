import { vi } from 'vitest';

// Global mocks for jsdom environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock URL.createObjectURL
if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: vi.fn(() => 'blob:mock-image-url'),
  });
}

// Mock alert, confirm, prompt
window.alert = window.alert || vi.fn();
window.confirm = window.confirm || vi.fn(() => true);
window.prompt = window.prompt || vi.fn();
