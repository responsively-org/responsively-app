import * as React from 'react';

import {render, fireEvent, cleanup} from '@testing-library/react';

import {SettingsContent} from './SettingsContent';

const mockOnClose = vi.fn();

describe('SettingsContent', () => {
  const renderComponent = () => render(<SettingsContent onClose={mockOnClose} />);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(window.electron.store.get).mockImplementation((key) => {
      if (key === 'homepage') return 'https://home.example/';
      if (key === 'userPreferences.screenshot.saveLocation') return '/tmp/screenshots';
      return '';
    });
  });

  afterEach(cleanup);

  it('Accept-Language is saved to store', () => {
    const {getByTestId} = renderComponent();

    const acceptLanguageInput = getByTestId('settings-accept_language-input');
    const screenshotLocationInput = getByTestId('settings-screenshot_location-input');
    const popupBehaviorSelect = getByTestId('settings-popup_behavior-select');
    const saveButton = getByTestId('settings-save-button');

    fireEvent.change(acceptLanguageInput, {target: {value: 'cz-Cz'}});
    fireEvent.change(screenshotLocationInput, {
      target: {value: './path/location'},
    });
    fireEvent.change(popupBehaviorSelect, {target: {value: 'external'}});
    fireEvent.click(saveButton);

    expect(window.electron.store.set).toHaveBeenNthCalledWith(
      1,
      'userPreferences.screenshot.saveLocation',
      './path/location'
    );
    expect(window.electron.store.set).toHaveBeenNthCalledWith(
      2,
      'userPreferences.webRequestHeaderAcceptLanguage',
      'cz-Cz'
    );
    expect(window.electron.store.set).toHaveBeenNthCalledWith(
      3,
      'userPreferences.popupBehavior',
      'external'
    );

    expect(mockOnClose).toHaveBeenCalled();
  });

  it.each([
    ['example.com/home', 'https://example.com/home'],
    ['localhost:3000', 'http://localhost:3000/'],
    ['example.com:3000', 'https://example.com:3000/'],
    ['file:///tmp/home.html', 'file:///tmp/home.html'],
    ['file:/tmp/home.html', 'file:///tmp/home.html'],
  ])('saves the homepage %s as %s', (entered, saved) => {
    const {getByTestId} = renderComponent();
    fireEvent.change(getByTestId('settings-homepage-input'), {target: {value: entered}});
    fireEvent.click(getByTestId('settings-save-button'));

    expect(window.electron.store.set).toHaveBeenCalledWith('homepage', saved);
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it.each(['', 'not a url', 'javascript:alert(1)', 'mailto:user@example.com', 'ftp://example.com'])(
    'rejects invalid or unsupported homepage %s without saving settings',
    (homepage) => {
      const {getByTestId, getByRole} = renderComponent();
      fireEvent.change(getByTestId('settings-homepage-input'), {target: {value: homepage}});
      fireEvent.click(getByTestId('settings-save-button'));

      expect(getByRole('alert')).toHaveTextContent('valid homepage URL');
      expect(getByTestId('settings-homepage-input')).toHaveAttribute('aria-invalid', 'true');
      expect(window.electron.store.set).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  );
});
