import {act, cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {IPC_MAIN_CHANNELS} from 'common/constants';
import {SPONSOR_URL_BASE} from 'renderer/components/Notifications/Notifications';
import SupportPopover from './index';

const openPopover = async () => {
  render(<SupportPopover />);
  fireEvent.click(screen.getByRole('button', {name: 'Support Responsively'}));
  await screen.findByText('Enjoying Responsively?');
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(window.electron.ipcRenderer.invoke).mockResolvedValue(undefined);
});

afterEach(cleanup);

describe('SupportPopover', () => {
  it('opens support choices without opening a website or copying anything', async () => {
    await openPopover();

    expect(screen.getByRole('button', {name: 'Sponsor'})).toBeVisible();
    expect(screen.getByRole('button', {name: 'Star on GitHub'})).toBeVisible();
    expect(screen.getByRole('button', {name: 'Share Responsively'})).toBeVisible();
    expect(window.electron.ipcRenderer.sendMessage).not.toHaveBeenCalled();
    expect(window.electron.ipcRenderer.invoke).not.toHaveBeenCalledWith(
      IPC_MAIN_CHANNELS.COPY_TO_CLIPBOARD,
      expect.anything()
    );
  });

  it('opens the existing sponsor page and the public repository when selected', async () => {
    await openPopover();

    fireEvent.click(screen.getByRole('button', {name: 'Sponsor'}));
    expect(window.electron.ipcRenderer.sendMessage).toHaveBeenLastCalledWith(
      IPC_MAIN_CHANNELS.OPEN_EXTERNAL,
      {url: `${SPONSOR_URL_BASE}&utm_term=support-popover`}
    );

    fireEvent.click(screen.getByRole('button', {name: 'Star on GitHub'}));
    expect(window.electron.ipcRenderer.sendMessage).toHaveBeenLastCalledWith(
      IPC_MAIN_CHANNELS.OPEN_EXTERNAL,
      {url: 'https://github.com/responsively-org/responsively-app'}
    );
  });

  it('copies the website link and resets the confirmation when reopened', async () => {
    await openPopover();

    fireEvent.click(screen.getByRole('button', {name: 'Share Responsively'}));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Link copied!'));
    expect(window.electron.ipcRenderer.invoke).toHaveBeenCalledWith(
      IPC_MAIN_CHANNELS.COPY_TO_CLIPBOARD,
      'https://responsively.app'
    );
    expect(window.electron.ipcRenderer.sendMessage).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', {name: 'Support Responsively'}));
    await waitFor(() => expect(screen.queryByText('Enjoying Responsively?')).toBeNull());
    fireEvent.click(screen.getByRole('button', {name: 'Support Responsively'}));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Copy a link to Responsively')
    );
  });

  it.each(['resolve', 'reject'] as const)(
    'ignores a stale clipboard %s after reopening and starting another copy',
    async (outcome) => {
      await openPopover();
      let resolveOld!: () => void;
      let rejectOld!: (error: Error) => void;
      const oldCopy = new Promise<void>((resolve, reject) => {
        resolveOld = resolve;
        rejectOld = reject;
      });
      vi.mocked(window.electron.ipcRenderer.invoke).mockReturnValueOnce(oldCopy);
      fireEvent.click(screen.getByRole('button', {name: 'Share Responsively'}));
      expect(screen.getByRole('button', {name: 'Share Responsively'})).toBeDisabled();

      fireEvent.click(screen.getByRole('button', {name: 'Support Responsively'}));
      await waitFor(() => expect(screen.queryByText('Enjoying Responsively?')).toBeNull());
      fireEvent.click(screen.getByRole('button', {name: 'Support Responsively'}));
      await screen.findByText('Enjoying Responsively?');
      expect(screen.getByRole('status')).toHaveTextContent('Copy a link to Responsively');

      let resolveNew!: () => void;
      const newCopy = new Promise<void>((resolve) => {
        resolveNew = resolve;
      });
      vi.mocked(window.electron.ipcRenderer.invoke).mockReturnValueOnce(newCopy);
      fireEvent.click(screen.getByRole('button', {name: 'Share Responsively'}));

      await act(async () => {
        if (outcome === 'resolve') resolveOld();
        else rejectOld(new Error('old request failed'));
      });
      expect(screen.getByRole('status')).toHaveTextContent('Copying link…');
      expect(screen.getByRole('button', {name: 'Share Responsively'})).toBeDisabled();

      await act(async () => resolveNew());
      expect(screen.getByRole('status')).toHaveTextContent('Link copied!');
      expect(screen.getByRole('button', {name: 'Share Responsively'})).toBeEnabled();
    }
  );

  it('shows a retry message if the clipboard action fails', async () => {
    await openPopover();
    vi.mocked(window.electron.ipcRenderer.invoke).mockRejectedValueOnce(new Error('unavailable'));

    fireEvent.click(screen.getByRole('button', {name: 'Share Responsively'}));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Could not copy. Try again.')
    );
    expect(screen.getByRole('button', {name: 'Share Responsively'})).toBeEnabled();

    fireEvent.click(screen.getByRole('button', {name: 'Share Responsively'}));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Link copied!'));
  });
});
