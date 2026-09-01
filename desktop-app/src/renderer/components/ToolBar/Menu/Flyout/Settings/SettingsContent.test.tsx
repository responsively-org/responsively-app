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
});
