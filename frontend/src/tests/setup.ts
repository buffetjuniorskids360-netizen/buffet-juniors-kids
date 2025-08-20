import React from 'react';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn().mockReturnValue([]),
})) as any;

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
global.scrollTo = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock Recharts (for chart components)
vi.mock('recharts', () => ({
  LineChart: vi.fn(() => null),
  Line: vi.fn(() => null),
  AreaChart: vi.fn(() => null),
  Area: vi.fn(() => null),
  BarChart: vi.fn(() => null),
  Bar: vi.fn(() => null),
  PieChart: vi.fn(() => null),
  Pie: vi.fn(() => null),
  XAxis: vi.fn(() => null),
  YAxis: vi.fn(() => null),
  CartesianGrid: vi.fn(() => null),
  Tooltip: vi.fn(() => null),
  Legend: vi.fn(() => null),
  ResponsiveContainer: vi.fn(() => null),
  Cell: vi.fn(() => null),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop) => {
        return vi.fn(() => null);
      },
    }
  ),
  AnimatePresence: vi.fn(() => null),
}));

// Error boundary for tests
window.addEventListener('error', (event) => {
  console.error('Unhandled error during test:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection during test:', event.reason);
});