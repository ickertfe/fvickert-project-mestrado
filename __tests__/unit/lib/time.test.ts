import { describe, it, expect, vi } from 'vitest';
import {
  formatDuration,
  formatTimeMMSS,
  formatTimestamp,
  formatDate,
  delay,
  debounce,
  throttle,
} from '@/utils/time';

describe('formatDuration', () => {
  it('should format milliseconds', () => {
    expect(formatDuration(500)).toBe('500ms');
  });

  it('should format seconds', () => {
    expect(formatDuration(5000)).toBe('5s');
  });

  it('should format minutes and seconds', () => {
    expect(formatDuration(65000)).toBe('1m 5s');
  });

  it('should format hours, minutes, and seconds', () => {
    expect(formatDuration(3665000)).toBe('1h 1m 5s');
  });
});

describe('formatTimeMMSS', () => {
  it('should format as MM:SS', () => {
    expect(formatTimeMMSS(0)).toBe('00:00');
    expect(formatTimeMMSS(5000)).toBe('00:05');
    expect(formatTimeMMSS(65000)).toBe('01:05');
    expect(formatTimeMMSS(3600000)).toBe('60:00');
  });
});

describe('formatTimestamp', () => {
  it('should format timestamp', () => {
    const date = new Date('2024-01-15T14:30:00');
    const result = formatTimestamp(date, 'pt-BR');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe('formatDate', () => {
  it('should format date', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date, 'pt-BR');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe('delay', () => {
  it('should delay execution', async () => {
    const start = Date.now();
    await delay(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(95);
  });
});

describe('debounce', () => {
  it('should debounce function calls', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('throttle', () => {
  it('should throttle function calls', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
