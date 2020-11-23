import React, {useMemo, useState} from 'react';
import {useTheme} from '@material-ui/core/styles';
import {v4 as uuidv4} from 'uuid';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
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
import Menu from './Menu';
import DeleteWorkspaceDialog from './DeleteWorkspaceDialog';

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
  onDeleteWorkspace,
}) {
  const theme = useTheme();
  const commonClasses = useCommonStyles();
  const classes = useWorkspaceSelectorStyles();
  const [open, setMenuOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [
    deleteWorkspaceConfirmation,
    showDeleteWorkspaceConfirmation,
  ] = useState(false);

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

  const handleAddWorkspace = () => {
    const newWorkspace = {
      id: uuidv4(),
      name: `Workspace ${availableWorkspaces.ids.length}`,
      devices: undefined,
    };
    onNewWorkspace(newWorkspace);
    setMenuOpen(false);
    setOpenModal(true);
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
              <Menu {...props} onAddWorkspace={handleAddWorkspace} />
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
      <div className={commonClasses.sidebarContentSectionFooter}>
        <Button
          color="primary"
          variant="contained"
          onClick={() => setOpenModal(true)}
        >
          Customize
        </Button>
        {value !== 'default-workspace' && (
          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            onClick={() => showDeleteWorkspaceConfirmation(true)}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        )}
      </div>
      <DeleteWorkspaceDialog
        open={deleteWorkspaceConfirmation}
        onCancel={() => showDeleteWorkspaceConfirmation(false)}
        onOk={() => {
          onDeleteWorkspace(value);
          showDeleteWorkspaceConfirmation(false);
        }}
      />
      <DeviceManagerContainer
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}

export default WorkspaceSelector;
