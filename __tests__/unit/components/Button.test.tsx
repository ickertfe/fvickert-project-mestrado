import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);

    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('should be disabled when isLoading prop is true', () => {
    render(<Button isLoading>Click me</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show loading spinner when isLoading', () => {
    render(<Button isLoading>Click me</Button>);

    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('should apply variant classes', () => {
    const { rerender } = render(<Button variant="default">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-chat-header');

    rerender(<Button variant="destructive">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-action-danger');

    rerender(<Button variant="outline">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });

  it('should apply size classes', () => {
    const { rerender } = render(<Button size="default">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10');

    rerender(<Button size="sm">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8');

    rerender(<Button size="lg">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Button</Button>);

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
