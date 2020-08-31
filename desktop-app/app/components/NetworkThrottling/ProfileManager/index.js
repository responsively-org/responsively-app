import React, {useState} from 'react';
import cx from 'classnames';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import TextField from '@material-ui/core/TextField';
import NumberFormat from 'react-number-format';
import InputAdornment from '@material-ui/core/InputAdornment';
import styles from './styles.css';

function NumberFormatCustom(props) {
  const {inputRef, onChange, ...other} = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            name: props.name,
            value: values.floatValue,
          },
        });
      }}
      allowNegative={false}
      decimalScale={0}
    />
  );
}

export default function ProfileManager({profiles, onSave}) {
  const [currentProfiles, updateProfiles] = useState(profiles);
  const [newElement, setNewElement] = useState({type: 'Custom'});
  const [editModeRows, toggleEditModeRows] = useState({});

  const newElementIsInvalid =
    newElement.title != null &&
    (newElement.title.trim() === '' ||
      newElement.title.length > 20 ||
      currentProfiles.filter(x => x.title === newElement.title).length !== 0);

  const addNewElement = () => {
    if (!newElementIsInvalid && newElement.title != null) {
      setNewElement({type: 'Custom'});
      updateProfiles([...currentProfiles, newElement]);
    }
  };

  const removeProfile = title => {
    updateProfiles(currentProfiles.filter(p => p.title !== title));
  };

  const updateProfile = (title, key, value) => {
    const profile = currentProfiles.find(x => x.title === title);
    if (profile != null && profile.type === 'Custom') {
      profile[key] = value;
      updateProfiles([...currentProfiles]);
    }
  };

  const toggleEditMode = row => {
    if (row.type !== 'Custom') return;
    editModeRows[row.title] = !editModeRows[row.title];
    toggleEditModeRows({...editModeRows});
  };

  return (
    <div className={cx(styles.profileManagerContainer)}>
      <TableContainer className={cx(styles.profilesContainer)}>
        <Table size="small">
          <TableHead className={cx(styles.profilesHeader)}>
            <TableRow>
              <TableCell style={{width: '32%'}}>Name</TableCell>
              <TableCell style={{width: '21%'}} align="right">
                Download
              </TableCell>
              <TableCell style={{width: '21%'}} align="right">
                Upload
              </TableCell>
              <TableCell style={{width: '21%'}} align="right">
                Latency
              </TableCell>
              <TableCell style={{width: '5%'}} align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {currentProfiles.map(row => (
              <TableRow key={row.title} className={cx(styles.profilesRow)}>
                <TableCell
                  component="th"
                  scope="row"
                  className={cx({
                    [styles.customProfile]: row.type === 'Custom',
                  })}
                  onClick={() => toggleEditMode(row)}
                >
                  {row.title}
                </TableCell>
                <TableCell align="right">
                  {row.type !== 'Online' && (
                    <TextField
                      className={cx(styles.numericField, {
                        [styles.numericFieldDisabled]:
                          row.type !== 'Custom' || !editModeRows[row.title],
                      })}
                      value={row.downloadKps == null ? '' : row.downloadKps}
                      onChange={e =>
                        updateProfile(row.title, 'downloadKps', e.target.value)
                      }
                      fullWidth
                      variant="outlined"
                      placeholder={
                        row.type !== 'Custom' || !editModeRows[row.title]
                          ? ''
                          : '(optional)'
                      }
                      InputProps={{
                        inputComponent: NumberFormatCustom,
                        endAdornment: (
                          <InputAdornment position="end">Kb/s</InputAdornment>
                        ),
                      }}
                      disabled={
                        row.type !== 'Custom' || !editModeRows[row.title]
                      }
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  {row.type !== 'Online' && (
                    <TextField
                      className={cx(styles.numericField, {
                        [styles.numericFieldDisabled]:
                          row.type !== 'Custom' || !editModeRows[row.title],
                      })}
                      value={row.uploadKps == null ? '' : row.uploadKps}
                      onChange={e =>
                        updateProfile(row.title, 'uploadKps', e.target.value)
                      }
                      fullWidth
                      variant="outlined"
                      placeholder={
                        row.type !== 'Custom' || !editModeRows[row.title]
                          ? ''
                          : '(optional)'
                      }
                      InputProps={{
                        inputComponent: NumberFormatCustom,
                        endAdornment: (
                          <InputAdornment position="end">Kb/s</InputAdornment>
                        ),
                      }}
                      disabled={
                        row.type !== 'Custom' || !editModeRows[row.title]
                      }
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  {row.type !== 'Online' && (
                    <TextField
                      className={cx(styles.numericField, {
                        [styles.numericFieldDisabled]:
                          row.type !== 'Custom' || !editModeRows[row.title],
                      })}
                      value={row.latencyMs == null ? '' : row.latencyMs}
                      onChange={e =>
                        updateProfile(row.title, 'latencyMs', e.target.value)
                      }
                      fullWidth
                      variant="outlined"
                      placeholder={
                        row.type !== 'Custom' || !editModeRows[row.title]
                          ? ''
                          : '(optional)'
                      }
                      InputProps={{
                        inputComponent: NumberFormatCustom,
                        endAdornment: (
                          <InputAdornment position="end">ms</InputAdornment>
                        ),
                      }}
                      disabled={
                        row.type !== 'Custom' || !editModeRows[row.title]
                      }
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  {row.type === 'Custom' && (
                    <CancelOutlinedIcon
                      className={cx(styles.actionIcon)}
                      onClick={() => removeProfile(row.title)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TableFooter component={Table}>
        <TableHead className={cx(styles.profilesHeader)}>
          <TableRow>
            <TableCell style={{width: '32%'}}>
              <TextField
                autoFocus
                value={newElement.title || ''}
                onChange={e =>
                  setNewElement({...newElement, title: e.target.value})
                }
                error={newElementIsInvalid}
                fullWidth
                variant="outlined"
                placeholder="New Profile Name"
                className={cx(styles.titleField)}
              />
            </TableCell>
            <TableCell style={{width: '21%'}} align="right">
              <TextField
                className={cx(styles.numericField)}
                value={
                  newElement.downloadKps == null ? '' : newElement.downloadKps
                }
                onChange={e =>
                  setNewElement({...newElement, downloadKps: e.target.value})
                }
                fullWidth
                variant="outlined"
                placeholder="(optional)"
                InputProps={{
                  inputComponent: NumberFormatCustom,
                  endAdornment: (
                    <InputAdornment position="end">Kb/s</InputAdornment>
                  ),
                }}
              />
            </TableCell>
            <TableCell style={{width: '21%'}} align="right">
              <TextField
                className={cx(styles.numericField)}
                value={newElement.uploadKps == null ? '' : newElement.uploadKps}
                onChange={e =>
                  setNewElement({...newElement, uploadKps: e.target.value})
                }
                fullWidth
                variant="outlined"
                placeholder="(optional)"
                InputProps={{
                  inputComponent: NumberFormatCustom,
                  endAdornment: (
                    <InputAdornment position="end">Kb/s</InputAdornment>
                  ),
                }}
              />
            </TableCell>
            <TableCell style={{width: '21%'}} align="right">
              <TextField
                className={cx(styles.numericField)}
                value={newElement.latencyMs == null ? '' : newElement.latencyMs}
                onChange={e =>
                  setNewElement({...newElement, latencyMs: e.target.value})
                }
                fullWidth
                variant="outlined"
                placeholder="(optional)"
                InputProps={{
                  inputComponent: NumberFormatCustom,
                  endAdornment: (
                    <InputAdornment position="end">ms</InputAdornment>
                  ),
                }}
              />
            </TableCell>
            <TableCell style={{width: '5%'}} align="right">
              <AddCircleOutlineOutlinedIcon
                className={cx(styles.actionIcon)}
                onClick={addNewElement}
              />
            </TableCell>
          </TableRow>
        </TableHead>
      </TableFooter>
      <Button
        variant="contained"
        color="primary"
        aria-label="clear network cache"
        component="span"
        onClick={() => onSave(currentProfiles)}
        size="large"
        className={cx(styles.saveButton)}
      >
        Save
      </Button>
    </div>
  );
}
