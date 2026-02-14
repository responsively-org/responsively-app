import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import designOverlayReducer from 'renderer/store/features/design-overlay';
import type { Device } from 'common/deviceList';
import DesignOverlayControls from './index';

// Mock electron.store
const mockStore = {
  get: jest.fn(),
  set: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (window.electron.store.get as jest.Mock) = mockStore.get;
  (window.electron.store.set as jest.Mock) = mockStore.set;
  mockStore.get.mockReturnValue({});
});

// Mock FileUploader component
jest.mock('renderer/components/FileUploader', () => ({
  FileUploader: ({
    handleFileUpload,
  }: {
    handleFileUpload: (file: File) => void;
  }) => (
    <div data-testid="file-uploader">
      <input
        type="file"
        data-testid="file-input"
        onChange={(e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
    </div>
  ),
}));

// Mock Modal component
jest.mock('renderer/components/Modal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, title, children }: any) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

// Mock Button component
jest.mock('renderer/components/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, isPrimary, isTextButton }: any) => (
    <button
      type="button"
      onClick={onClick}
      data-primary={isPrimary}
      data-text-button={isTextButton}
    >
      {children}
    </button>
  ),
}));

const mockDevice: Device = {
  id: '10019',
  type: 'phone',
  dpr: 3,
  capabilities: ['touch', 'mobile'],
  isTouchCapable: true,
  isMobileCapable: true,
  name: 'iPhone 13',
  width: 390,
  height: 844,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
};

const createStore = (initialState = {}) =>
  configureStore({
    reducer: {
      designOverlay: designOverlayReducer,
    },
    preloadedState: {
      designOverlay: initialState,
    },
  });

const renderWithRedux = (component: React.ReactElement, initialState = {}) => {
  const store = createStore(initialState);
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('DesignOverlayControls', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders modal when isOpen is true', () => {
    renderWithRedux(
      <DesignOverlayControls device={mockDevice} isOpen onClose={mockOnClose} />
    );

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Design Overlay Settings')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    renderWithRedux(
      <DesignOverlayControls
        device={mockDevice}
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    renderWithRedux(
      <DesignOverlayControls device={mockDevice} isOpen onClose={mockOnClose} />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows opacity slider when image is uploaded', async () => {
    const { store } = renderWithRedux(
      <DesignOverlayControls device={mockDevice} isOpen onClose={mockOnClose} />
    );

    const fileInput = screen.getByTestId('file-input');
    const mockFile = new File(['dummy'], 'test.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });

  it('updates opacity when slider is moved', async () => {
    const { store } = renderWithRedux(
      <DesignOverlayControls device={mockDevice} isOpen onClose={mockOnClose} />
    );

    const fileInput = screen.getByTestId('file-input');
    const mockFile = new File(['dummy'], 'test.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      const opacitySlider = screen.getByRole('slider');
      expect(opacitySlider).toBeInTheDocument();

      fireEvent.change(opacitySlider, { target: { value: '75' } });
      expect(opacitySlider).toHaveValue('75');
    });
  });

  it('saves overlay when save button is clicked', async () => {
    const { store } = renderWithRedux(
      <DesignOverlayControls device={mockDevice} isOpen onClose={mockOnClose} />
    );

    const fileInput = screen.getByTestId('file-input');
    const mockFile = new File(['dummy'], 'test.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      const state = store.getState();
      const overlay = state.designOverlay['390x844'];
      expect(overlay).toBeDefined();
      expect(overlay?.enabled).toBe(true);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('removes overlay when remove button is clicked', async () => {
    const initialState = {
      '390x844': {
        image: 'data:image/png;base64,test',
        opacity: 50,
        position: 'overlay' as const,
        enabled: true,
      },
    };

    const { store } = renderWithRedux(
      <DesignOverlayControls
        device={mockDevice}
        isOpen
        onClose={mockOnClose}
      />,
      initialState
    );

    await waitFor(() => {
      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      const state = store.getState();
      expect(state.designOverlay['390x844']).toBeUndefined();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
