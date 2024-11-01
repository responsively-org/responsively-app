import * as React from 'react';

import { render, fireEvent } from '@testing-library/react';

import { SettingsContent } from './SettingsContent';

const mockOnClose = jest.fn();

describe('SettingsContentHeader', () => {
  const renderComponent = () =>
    render(<SettingsContent onClose={mockOnClose} />);

  it('Accept-Language is saved to store', () => {
    const { getByTestId } = renderComponent();

    const acceptLanguageInput = getByTestId('settings-accept_language-input');
    const screenshotLocationInput = getByTestId(
      'settings-screenshot_location-input'
    );
    const saveButton = getByTestId('settings-save-button');

    fireEvent.change(acceptLanguageInput, { target: { value: 'cz-Cz' } });
    fireEvent.change(screenshotLocationInput, {
      target: { value: './path/location' },
    });
    fireEvent.click(saveButton);

    expect(window.electron.store.set).toHaveBeenNthCalledWith(
      1,
      'userPreferences.screenshot.saveLocation',
      './path/location'
    );
    expect(window.electron.store.set).toHaveBeenNthCalledWith(
      2,
      'userPreferences.customTitlebar',
      undefined
    );
    expect(window.electron.store.set).toHaveBeenNthCalledWith(
      3,
      'userPreferences.webRequestHeaderAcceptLanguage',
      'cz-Cz'
    );

    expect(mockOnClose).toHaveBeenCalled();
  });
});
