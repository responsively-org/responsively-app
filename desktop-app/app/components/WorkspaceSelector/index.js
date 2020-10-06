import React, {useMemo} from 'react';
import {useTheme} from '@material-ui/core/styles';
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

/**
 * Allows to select a workspace
 * @param {Object} props
 * @param {string} props.value Workspace id
 * @param {function} props.onChange Called once workspace selected
 * @param {array} props.availableWorkspaces Available workspaces
 */
function WorkspaceSelector({availableWorkspaces, value, onChange}) {
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
          options={options}
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

export default WorkspaceSelector;
