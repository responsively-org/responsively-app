const Store = require('electron-store');

const schema = {
  ui: {
    type: 'object',
    properties: {
      darkMode: {
        type: 'boolean',
        default: true,
      },
    },
  },
};

const store = new Store({ schema, watch: true });

export default store;
