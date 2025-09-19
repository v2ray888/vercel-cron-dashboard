import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// 清理每个测试后的DOM
afterEach(() => {
  cleanup();
});