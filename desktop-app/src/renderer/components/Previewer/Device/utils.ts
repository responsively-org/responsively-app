import {HistoryItem} from 'renderer/components/ToolBar/AddressBar/SuggestionList';

export const appendHistory = (url: string, title: string) => {
  if (url === `${title}/`) {
    return;
  }
  const history: HistoryItem[] = window.electron.store.get('history');
  window.electron.store.set(
    'history',
    [
      {url, title, lastVisited: new Date().getTime()},
      ...history.filter(({url: _url}) => url !== _url),
    ].slice(0, 100)
  );
};
