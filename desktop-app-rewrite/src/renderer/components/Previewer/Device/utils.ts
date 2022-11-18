import { HistoryItem } from 'renderer/components/ToolBar/AddressBar/SuggestionList';

// eslint-disable-next-line import/prefer-default-export
export const appendHistory = (url: string, title: string) => {
  if (url === `${title}/`) {
    return;
  }
  const history: HistoryItem[] = window.electron.store.get('history');
  window.electron.store.set(
    'history',
    [
      { url, title, lastVisited: new Date().getTime() },
      ...history.filter(({ url: _url }) => url !== _url),
    ].slice(0, 100)
  );
};
