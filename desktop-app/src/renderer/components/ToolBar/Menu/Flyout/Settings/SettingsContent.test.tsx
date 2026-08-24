import * as React from 'react';

import {render, fireEvent} from '@testing-library/react';

import {SettingsContent} from './SettingsContent';

const mockOnClose = vi.fn();

describe('SettingsContentHeader', () => {
  const renderComponent = () => render(<SettingsContent onClose={mockOnClose} />);

  it('Accept-Language is saved to store', () => {
    const {getByTestId} = renderComponent();

    const acceptLanguageInput = getByTestId('settings-accept_language-input');
    const screenshotLocationInput = getByTestId('settings-screenshot_location-input');
    const saveButton = getByTestId('settings-save-button');

    fireEvent.change(acceptLanguageInput, {target: {value: 'cz-Cz'}});
    fireEvent.change(screenshotLocationInput, {
      target: {value: './path/location'},
    });
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

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('Hide mobile scrollbars preference is saved to store', () => {
    vi.mocked(window.electron.store.get).mockImplementation((key: string) => {
      if (key === 'userPreferences.hideMobileScrollbars') {
        return true;
      }
      if (key === 'userPreferences.screenshot.saveLocation') {
        return './path/location';
      }
      return undefined;
    });

    const {getByTestId} = renderComponent();

    const hideMobileScrollbarsToggle = getByTestId('settings-hide_mobile_scrollbars-toggle');
    const saveButton = getByTestId('settings-save-button');

    expect(hideMobileScrollbarsToggle).toBeChecked();

    fireEvent.click(hideMobileScrollbarsToggle);
    fireEvent.click(saveButton);

    expect(hideMobileScrollbarsToggle).not.toBeChecked();
    expect(window.electron.store.set).toHaveBeenCalledWith(
      'userPreferences.hideMobileScrollbars',
      false
    );

    expect(mockOnClose).toHaveBeenCalled();
  });
});
