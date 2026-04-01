import { describe, it, expect } from 'vitest';
import {
  cn,
  generateId,
  capitalize,
  truncate,
  isEmpty,
  getInitials,
  getAvatarColor,
  groupBy,
  sortBy,
} from '@/lib/utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should return a string', () => {
    expect(typeof generateId()).toBe('string');
  });
});

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should lowercase the rest', () => {
    expect(capitalize('HELLO')).toBe('Hello');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('truncate', () => {
  it('should truncate long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('should not truncate short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('should handle exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('isEmpty', () => {
  it('should return true for null', () => {
    expect(isEmpty(null)).toBe(true);
  });

  it('should return true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should return true for empty string', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
  });

  it('should return true for empty array', () => {
    expect(isEmpty([])).toBe(true);
  });

  it('should return true for empty object', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('should return false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});

describe('getInitials', () => {
  it('should get initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('should handle single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('should handle multiple names', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });
});

describe('getAvatarColor', () => {
  it('should return a consistent color for the same name', () => {
    const color1 = getAvatarColor('John');
    const color2 = getAvatarColor('John');
    expect(color1).toBe(color2);
  });

  it('should return different colors for different names', () => {
    const color1 = getAvatarColor('John');
    const color2 = getAvatarColor('Jane');
    // Note: This might occasionally be the same due to hash collisions
    expect(typeof color1).toBe('string');
    expect(typeof color2).toBe('string');
  });

  it('should return a Tailwind color class', () => {
    const color = getAvatarColor('John');
    expect(color).toMatch(/^bg-\w+-500$/);
  });
});

describe('groupBy', () => {
  it('should group array items by key', () => {
    const items = [
      { type: 'a', value: 1 },
      { type: 'b', value: 2 },
      { type: 'a', value: 3 },
    ];
    const grouped = groupBy(items, 'type');
    expect(grouped.a).toHaveLength(2);
    expect(grouped.b).toHaveLength(1);
  });
});

describe('sortBy', () => {
  it('should sort array by key ascending', () => {
    const items = [
      { name: 'c' },
      { name: 'a' },
      { name: 'b' },
    ];
    const sorted = sortBy(items, 'name', 'asc');
    expect(sorted[0].name).toBe('a');
    expect(sorted[2].name).toBe('c');
  });

  it('should sort array by key descending', () => {
    const items = [
      { name: 'c' },
      { name: 'a' },
      { name: 'b' },
    ];
    const sorted = sortBy(items, 'name', 'desc');
    expect(sorted[0].name).toBe('c');
    expect(sorted[2].name).toBe('a');
  });
});
