import { DOCK_POSITION } from '../common/constants';

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
  devtools: {
    type: 'object',
    properties: {
      dockPosition: {
        type: 'string',
        enum: Object.keys(DOCK_POSITION),
        default: DOCK_POSITION.BOTTOM,
      },
    },
  },
};

const store = new Store({ schema, watch: true });

export default store;
