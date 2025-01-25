import path from 'path';
import { homedir } from 'os';
import { DOCK_POSITION, PREVIEW_LAYOUTS } from '../common/constants';
import { migrations } from './migrations';

const Store = require('electron-store');

const schema = {
  ui: {
    type: 'object',
    properties: {
      darkMode: {
        type: 'boolean',
        default: true,
      },
      previewlayout: {
        enum: Object.values(PREVIEW_LAYOUTS),
        default: PREVIEW_LAYOUTS.FLEX,
      },
    },
  },
  renderer: {
    type: 'object',
    properties: {
      individualZoomStepIndex: {
        type: 'number',
        default: 8,
      },
      zoomStepIndex: {
        type: 'number',
        default: 3,
      },
    },
    default: {},
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
      // TODO: remove this in a future version of v1.2.0
      activeDevices: {
        type: 'array',
        items: {
          type: 'string',
        },
        default: ['10008', '10013', '10015'],
      },
      previewSuites: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            devices: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        default: [
          {
            id: 'default',
            name: 'Default',
            devices: ['10008', '10013', '10015'],
          },
        ],
      },
      customDevices: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
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
            dpr: {
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
      webRequestHeaderAcceptLanguage: {
        type: 'string',
        default: '',
      },
      allowInsecureSSLConnections: {
        type: 'boolean',
        default: false,
      },
      guides: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            positions: {
              type: 'array',
              items: {
                type: 'number',
              },
            },
            is_vertical: {
              type: 'boolean',
            },
            resolution: {
              type: 'string',
            },
          },
          default: {},
        },
        default: [],
      },
      screenshot: {
        type: 'object',
        properties: {
          saveLocation: {
            type: 'string',
            default: path.join(homedir(), `Desktop/Responsively-Screenshots`),
          },
        },
        default: {},
      },
    },
    default: {},
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
  seenReleaseNotes: {
    type: 'array',
    items: {
      type: 'string',
    },
    default: [],
  },
  bookmarks: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        address: {
          type: 'string',
        },
      },
    },
    default: [],
  },
  sponsorship: {
    type: 'object',
    properties: {
      lastShown: {
        type: 'number',
      },
    },
    default: {},
  },
} as const;

const store = new Store({
  schema,
  watch: true,
  migrations,
});

export default store;
