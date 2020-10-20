import React, {useMemo} from 'react';
import {useTheme} from '@material-ui/core/styles';
import {components} from 'react-select';
import {v4 as uuidv4} from 'uuid';

import DevicesIcon from '../icons/Devices';
import {
  HORIZONTAL_LAYOUT,
  FLEXIGRID_LAYOUT,
  INDIVIDUAL_LAYOUT,
} from '../../constants/previewerLayouts';
import Select from '../Select';
import useCommonStyles from '../useCommonStyles';
import DeviceManagerContainer from '../../containers/DeviceManagerContainer';
import useWorkspaceSelectorStyles from './useWorkspaceSelectorStyles';
import {uniqueId} from 'lodash';

/**
 * Allows to select a workspace
 * @param {Object} props
 * @param {string} props.value Workspace id
 * @param {function} props.onChange Called once workspace selected
 * @param {array} props.availableWorkspaces Available workspaces
 */
function WorkspaceSelector({
  availableWorkspaces,
  value,
  onChange,
  onNewWorkspace,
}) {
  const theme = useTheme();
  const commonClasses = useCommonStyles();
  const classes = useWorkspaceSelectorStyles();
  const options = useMemo(
    () =>
      availableWorkspaces.map(workspace => ({
        value: workspace.id,
        label: workspace.name,
      })),
    [availableWorkspaces]
  );

  const selectedWorkspace = useMemo(
    () => availableWorkspaces.find(workspace => workspace.id === value),
    [availableWorkspaces, value]
  );

  return (
    <div className={commonClasses.sidebarContentSection}>
      <div className={classes.navBar}>
        <div className={commonClasses.sidebarContentSectionTitleBar}>
          <DevicesIcon
            width={26}
            margin={2}
            color={theme.palette.text.primary}
          />
          Workspace
        </div>
        <DeviceManagerContainer />
      </div>
      <div className={commonClasses.sidebarContentSectionContainer}>
        <Select
          // menuIsOpen
          options={options}
          components={{
            Menu: props => (
              <Menu
                {...props}
                onAddWorkspace={() => {
                  const newWorkspace = {
                    id: uuidv4(),
                    name: 'Workspace',
                    devices: undefined,
                  };
                  onNewWorkspace(newWorkspace);
                  props.selectOption({
                    value: newWorkspace.id,
                    label: newWorkspace.name,
                  });
                }}
              />
            ),
          }}
          value={{
            label: selectedWorkspace.name,
            value: selectedWorkspace.id,
          }}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

const Menu = props => {
  const {onAddWorkspace, ...menuProps} = props;

  return (
    <components.Menu {...props}>
      {props.children}
      <div
        style={menuProps.getStyles('option', props)}
        onClick={() => {
          menuProps.selectOption({isDisabled: false});
          onAddWorkspace();
        }}
      >
        Add New Workspace ...
      </div>
    </components.Menu>
  );
};

export default WorkspaceSelector;