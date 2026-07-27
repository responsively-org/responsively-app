import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import Popover from './index';

describe('Popover', () => {
  it('opens on trigger click and closes on Escape', async () => {
    render(
      <Popover trigger="Open me">
        <div>Panel content</div>
      </Popover>
    );
    expect(screen.queryByText('Panel content')).toBeNull();

    fireEvent.click(screen.getByRole('button', {name: 'Open me'}));
    await screen.findByText('Panel content');

    fireEvent.keyDown(document.activeElement ?? document.body, {key: 'Escape'});
    await waitFor(() => expect(screen.queryByText('Panel content')).toBeNull());
  });

  it('exposes close to render-prop children', async () => {
    render(
      <Popover trigger="Open">
        {({close}) => (
          <button type="button" onClick={() => close()}>
            Close now
          </button>
        )}
      </Popover>
    );

    fireEvent.click(screen.getByRole('button', {name: 'Open'}));
    const closeButton = await screen.findByRole('button', {name: 'Close now'});

    fireEvent.click(closeButton);
    await waitFor(() => expect(screen.queryByRole('button', {name: 'Close now'})).toBeNull());
  });
});
