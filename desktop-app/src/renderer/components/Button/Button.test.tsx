import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import Button from './index';

jest.mock('@iconify/react', () => ({
  Icon: () => <div data-testid="icon" />,
}));

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('applies custom class name', () => {
    render(<Button className="custom-class">Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toHaveClass('custom-class');
  });

  it('renders loading icon when isLoading is true', () => {
    render(<Button isLoading>Click me</Button>);
    const loadingIcon = screen.getByTestId('icon');
    expect(loadingIcon).toBeInTheDocument();
  });

  it('renders confirmation icon when loading is done', () => {
    jest.useFakeTimers();
    const { rerender } = render(<Button isLoading>Click me</Button>);

    act(() => {
      rerender(<Button isLoading={false}>Click me</Button>);
      jest.runAllTimers(); // Use act to advance timers
    });

    const confirmationIcon = screen.getByTestId('icon');
    expect(confirmationIcon).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('applies primary button styles', () => {
    render(<Button isPrimary>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toHaveClass('bg-emerald-500');
    expect(buttonElement).toHaveClass('text-white');
  });

  it('applies action button styles', () => {
    render(<Button isActionButton>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toHaveClass('bg-slate-200');
  });

  it('applies subtle hover styles', () => {
    render(<Button subtle>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toHaveClass('hover:bg-slate-200');
  });

  it('disables hover effects when disableHoverEffects is true', () => {
    render(
      <Button disableHoverEffects subtle>
        Click me
      </Button>
    );
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).not.toHaveClass('hover:bg-slate-200');
  });

  it('renders children correctly when not loading or loading done', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByText('Click me');
    expect(buttonElement).toBeInTheDocument();
  });

  it('does not render children when loading or loading done', () => {
    const { rerender } = render(<Button isLoading>Click me</Button>);
    expect(screen.queryByText('Click me')).not.toBeInTheDocument();

    act(() => {
      rerender(<Button isLoading={false}>Click me</Button>);
    });

    expect(screen.queryByText('Click me')).not.toBeInTheDocument();
  });
});
