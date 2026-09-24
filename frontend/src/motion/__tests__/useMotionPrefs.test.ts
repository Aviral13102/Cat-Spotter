import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMotionPrefs } from '../useMotionPrefs';

describe('useMotionPrefs', () => {
  it('detects reduced motion setting', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));

    const { result } = renderHook(() => useMotionPrefs());
    expect(result.current.isReduced).toBe(false);
  });
});
