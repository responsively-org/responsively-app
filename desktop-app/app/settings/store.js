import Store from 'electron-store';
import workspaceSchema from './schemas/workspaces';

const schema = {
  ...workspaceSchema,
};

const store = new Store({
  schema,
});

if (process.env.NODE_ENV === 'development') {
  store.onDidAnyChange((newValue, oldValue) => {
    console.group('Store got updated');
    console.info('From:', oldValue);
    console.info('To:', newValue);
    console.groupEnd();
  });
}

export default store;
