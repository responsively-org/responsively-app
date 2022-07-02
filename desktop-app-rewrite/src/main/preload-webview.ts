import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('asdf', {
  test: 'test',
});
console.log('asdf');
