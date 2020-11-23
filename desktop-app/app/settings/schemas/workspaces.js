const deviceSchema = {
  type: 'object',
};

const workspaceSchema = {
  availableWorkspaces: {
    type: 'object',
    properties: {
      byId: {
        type: 'object',
        patternProperties: {
          '.*': {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
              id: {
                type: 'string',
              },

              devices: {
                type: 'array',
                items: {
                  ...deviceSchema,
                },
              },
            },
            required: ['name', 'id'],
          },
        },
      },
      ids: {
        type: 'array',
        items: {
          type: 'string',
        },
        default: ['default-workspace'],
      },
    },
  },
  workspace: {
    type: 'string',
    default: 'default-workspace',
  },
};

export default workspaceSchema;
