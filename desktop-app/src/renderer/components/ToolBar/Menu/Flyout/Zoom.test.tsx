import {render, screen} from '@testing-library/react';
import Zoom from './Zoom';

// Zoom reads the current zoom factor from the store; the value itself is
// irrelevant to these accessibility assertions, so a constant suffices.
vi.mock('react-redux', () => ({
  useSelector: () => 1,
  useDispatch: () => vi.fn(),
}));

vi.mock('renderer/components/KeyboardShortcutsManager/useKeyboardShortcut', () => ({
  default: vi.fn(),
  SHORTCUT_CHANNEL: {},
}));

vi.mock('renderer/store/features/renderer', () => ({
  selectZoomFactor: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
}));

describe('Zoom controls accessibility', () => {
  it('exposes an accessible name on the zoom-out button', () => {
    render(<Zoom />);
    expect(screen.getByRole('button', {name: /zoom out/i})).toBeInTheDocument();
  });

  it('exposes an accessible name on the zoom-in button', () => {
    render(<Zoom />);
    expect(screen.getByRole('button', {name: /zoom in/i})).toBeInTheDocument();
  });
});
