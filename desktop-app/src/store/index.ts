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
  deviceManager: {
    type: 'object',
    properties: {
      activeDevices: {
        type: 'array',
        items: {
          type: 'string',
        },
        default: ['iPhone SE', 'iPhone XR', 'iPhone 12 Pro'],
      },
      customDevices: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            width: {
              type: 'number',
            },
            height: {
              type: 'number',
            },
            userAgent: {
              type: 'string',
            },
            type: {
              type: 'string',
            },
            dpi: {
              type: 'number',
            },
            isTouchCapable: {
              type: 'boolean',
            },
            isMobileCapable: {
              type: 'boolean',
            },
            capabilities: {
              type: 'array',
              items: {
                type: 'string',
              },
              default: [],
            },
            isCustom: {
              type: 'boolean',
              default: true,
            },
          },
        },
        default: [],
      },
    },
    default: {},
  },
  userPreferences: {
    type: 'object',
    properties: {
      allowInsecureSSLConnections: {
        type: 'boolean',
        default: false,
      },
    },
  },
  webPermissions: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
        },
        permissions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
              },
              status: {
                type: 'string',
                enum: ['GRANTED', 'DENIED'],
              },
            },
          },
        },
      },
    },
    default: [],
  },
  history: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        lastVisited: {
          type: 'number',
        },
      },
    },
    default: [],
  },
  homepage: {
    type: 'string',
    default: 'https://www.google.com/',
  },
};

const store = new Store({ schema, watch: true });

export default store;
