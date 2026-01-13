import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import designOverlayReducer from 'renderer/store/features/design-overlay';
import rulersReducer, { Coordinates } from 'renderer/store/features/ruler';
import DesignOverlay from './index';

// Mock GuideGrid component
jest.mock('../../Guides', () => ({
  __esModule: true,
  default: () => <div data-testid="guide-grid">GuideGrid</div>,
}));

const mockCoordinates: Coordinates = {
  deltaX: 0,
  deltaY: 0,
  scrollX: 0,
  scrollY: 0,
  innerWidth: 390,
  innerHeight: 844,
};

const createStore = (overlayState = {}) =>
  configureStore({
    reducer: {
      designOverlay: designOverlayReducer,
      rulers: rulersReducer,
    },
    preloadedState: {
      designOverlay: overlayState,
      rulers: {
        '390x844': {
          isRulerEnabled: false,
          rulerCoordinates: mockCoordinates,
        },
      },
    },
  });

const renderWithRedux = (component: React.ReactElement, overlayState = {}) => {
  const store = createStore(overlayState);
  return render(<Provider store={store}>{component}</Provider>);
};

describe('DesignOverlay', () => {
  const defaultProps = {
    resolution: '390x844',
    scaledWidth: 390,
    scaledHeight: 844,
    zoomFactor: 1,
    coordinates: mockCoordinates,
    position: 'overlay' as const,
    rulerMargin: 0,
    width: 390,
    height: 844,
  };

  it('does not render when overlay is disabled', () => {
    renderWithRedux(
      <DesignOverlay
        resolution={defaultProps.resolution}
        scaledWidth={defaultProps.scaledWidth}
        scaledHeight={defaultProps.scaledHeight}
        zoomFactor={defaultProps.zoomFactor}
        coordinates={defaultProps.coordinates}
        position={defaultProps.position}
        rulerMargin={defaultProps.rulerMargin}
        width={defaultProps.width}
        height={defaultProps.height}
      />
    );

    expect(screen.queryByAltText('Design overlay')).not.toBeInTheDocument();
  });

  it('does not render when no image is set', () => {
    const overlayState = {
      '390x844': {
        image: '',
        opacity: 50,
        position: 'overlay' as const,
        enabled: true,
      },
    };

    renderWithRedux(
      <DesignOverlay
        resolution={defaultProps.resolution}
        scaledWidth={defaultProps.scaledWidth}
        scaledHeight={defaultProps.scaledHeight}
        zoomFactor={defaultProps.zoomFactor}
        coordinates={defaultProps.coordinates}
        position={defaultProps.position}
        rulerMargin={defaultProps.rulerMargin}
        width={defaultProps.width}
        height={defaultProps.height}
      />,
      overlayState
    );

    expect(screen.queryByAltText('Design overlay')).not.toBeInTheDocument();
  });

  it('renders image when overlay is enabled', () => {
    const overlayState = {
      '390x844': {
        image: 'data:image/png;base64,test',
        opacity: 50,
        position: 'overlay' as const,
        enabled: true,
      },
    };

    renderWithRedux(
      <DesignOverlay
        resolution={defaultProps.resolution}
        scaledWidth={defaultProps.scaledWidth}
        scaledHeight={defaultProps.scaledHeight}
        zoomFactor={defaultProps.zoomFactor}
        coordinates={defaultProps.coordinates}
        position={defaultProps.position}
        rulerMargin={defaultProps.rulerMargin}
        width={defaultProps.width}
        height={defaultProps.height}
      />,
      overlayState
    );

    const image = screen.getByAltText('Design overlay');
    expect(image).toBeInTheDocument();
    expect(image).toHaveStyle({ opacity: '0.5' });
  });

  it('applies correct opacity in overlay mode', () => {
    const overlayState = {
      '390x844': {
        image: 'data:image/png;base64,test',
        opacity: 75,
        position: 'overlay' as const,
        enabled: true,
      },
    };

    renderWithRedux(
      <DesignOverlay
        resolution={defaultProps.resolution}
        scaledWidth={defaultProps.scaledWidth}
        scaledHeight={defaultProps.scaledHeight}
        zoomFactor={defaultProps.zoomFactor}
        coordinates={defaultProps.coordinates}
        position={defaultProps.position}
        rulerMargin={defaultProps.rulerMargin}
        width={defaultProps.width}
        height={defaultProps.height}
      />,
      overlayState
    );

    const image = screen.getByAltText('Design overlay');
    expect(image).toHaveStyle({ opacity: '0.75' });
  });

  it('applies 100% opacity in side mode', () => {
    const overlayState = {
      '390x844': {
        image: 'data:image/png;base64,test',
        opacity: 50,
        position: 'side' as const,
        enabled: true,
      },
    };

    renderWithRedux(
      <DesignOverlay
        resolution={defaultProps.resolution}
        scaledWidth={defaultProps.scaledWidth}
        scaledHeight={defaultProps.scaledHeight}
        zoomFactor={defaultProps.zoomFactor}
        coordinates={defaultProps.coordinates}
        position="side"
        rulerMargin={defaultProps.rulerMargin}
        width={defaultProps.width}
        height={defaultProps.height}
      />,
      overlayState
    );

    const image = screen.getByAltText('Design overlay');
    expect(image).toHaveStyle({ opacity: '1' });
  });

  it('shows GuideGrid only in side mode', () => {
    const overlayState = {
      '390x844': {
        image: 'data:image/png;base64,test',
        opacity: 50,
        position: 'side' as const,
        enabled: true,
      },
    };

    renderWithRedux(
      <DesignOverlay
        resolution={defaultProps.resolution}
        scaledWidth={defaultProps.scaledWidth}
        scaledHeight={defaultProps.scaledHeight}
        zoomFactor={defaultProps.zoomFactor}
        coordinates={defaultProps.coordinates}
        position="side"
        rulerMargin={defaultProps.rulerMargin}
        width={defaultProps.width}
        height={defaultProps.height}
      />,
      overlayState
    );

    expect(screen.getByTestId('guide-grid')).toBeInTheDocument();
  });

  it('does not show GuideGrid in overlay mode', () => {
    const overlayState = {
      '390x844': {
        image: 'data:image/png;base64,test',
        opacity: 50,
        position: 'overlay' as const,
        enabled: true,
      },
    };

    renderWithRedux(
      <DesignOverlay
        resolution={defaultProps.resolution}
        scaledWidth={defaultProps.scaledWidth}
        scaledHeight={defaultProps.scaledHeight}
        zoomFactor={defaultProps.zoomFactor}
        coordinates={defaultProps.coordinates}
        position={defaultProps.position}
        rulerMargin={defaultProps.rulerMargin}
        width={defaultProps.width}
        height={defaultProps.height}
      />,
      overlayState
    );

    expect(screen.queryByTestId('guide-grid')).not.toBeInTheDocument();
  });
});
