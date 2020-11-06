import React, {useMemo, useState} from 'react';
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
import Button from '@material-ui/core/Button';

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
  const [open, setMenuOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const options = useMemo(
    () =>
      availableWorkspaces.ids.map(workspaceId => {
        const workspace = availableWorkspaces.byId[workspaceId];

        return {
          value: workspace.id,
          label: workspace.name,
        };
      }),
    [availableWorkspaces]
  );

  const selectedWorkspace = availableWorkspaces.byId[value];

  const handleChange = option => {
    if (onChange) {
      onChange(option.value);
    }
    setMenuOpen(false);
  };

  const handleMenuOpen = () => {
    setMenuOpen(true);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

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
      </div>
      <div className={commonClasses.sidebarContentSectionContainer}>
        <Select
          menuIsOpen={open}
          options={options}
          components={{
            Menu: props => (
              <Menu
                {...props}
                onAddWorkspace={() => {
                  const newWorkspace = {
                    id: uuidv4(),
                    name: `Workspace ${availableWorkspaces.ids.length}`,
                    devices: undefined,
                  };
                  onNewWorkspace(newWorkspace);
                  setMenuOpen(false);
                  setOpenModal(true);
                }}
              />
            ),
          }}
          value={
            selectedWorkspace
              ? {
                  label: selectedWorkspace.name,
                  value: selectedWorkspace.id,
                }
              : undefined
          }
          innerProps={{
            onClick: handleMenuOpen,
          }}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
          onChange={handleChange}
        />
      </div>
      <Button
        color="primary"
        variant="contained"
        onClick={() => setOpenModal(true)}
      >
        Customize
      </Button>
      <DeviceManagerContainer
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
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
          onAddWorkspace();
        }}
      >
        Add New Workspace ...
      </div>
    </components.Menu>
  );
};

export default WorkspaceSelector;
