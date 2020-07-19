import React, {useState, useRef} from 'react';
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

import commonStyles from '../../common.styles.css';
import styles from './styles.css';

function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
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

export default function ProfileManager({
  profiles,
  onSave
}) {
  const tableRef = useRef(null);
  const [currentProfiles, updateProfiles] = useState(profiles);
  const [newElement, setNewElement] = useState({type: 'Custom'});

  const newElementIsInvalid = (newElement.title != null && (newElement.title.trim() == "" || newElement.title.length > 20 || currentProfiles.filter(x => x.title === newElement.title).length !== 0));

  const addNewElement = () => {
    if (!newElementIsInvalid && newElement.title != null) {
      setNewElement({type: 'Custom'});
      updateProfiles([...currentProfiles, newElement]);
      tableRef.current.scrollTop = 6;
      console.log(tableRef.current);
    }
  }

  const removeProfile = (title) => {
    updateProfiles(currentProfiles.filter(p => p.title !== title));
  }

  return (
  <div className={cx(styles.profileManagerContainer)}>
    <TableContainer ref={tableRef} className={cx(styles.profilesContainer)}>
      <Table size="small">
        <TableHead className={cx(styles.profilesHeader)}>
          <TableRow>
            <TableCell style={{ width: "32%" }}>Name</TableCell>
            <TableCell style={{ width: "21%" }} align="right">Download</TableCell>
            <TableCell style={{ width: "21%" }} align="right">Upload</TableCell>
            <TableCell style={{ width: "21%" }} align="right">Latency</TableCell>
            <TableCell style={{ width: "5%" }} align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentProfiles.map((row) => (
            <TableRow key={row.title} className={cx(styles.profilesRow)}>
              <TableCell component="th" scope="row">
                {row.title}
              </TableCell>
              <TableCell align="right">{row.downloadKps}</TableCell>
              <TableCell align="right">{row.uploadKps}</TableCell>
              <TableCell align="right">{row.latencyMs}</TableCell>
              <TableCell align="right">
                {row.type === 'Custom' && <CancelOutlinedIcon className={cx(styles.actionIcon)} onClick={() => removeProfile(row.title)} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <TableFooter component={Table}>
      <TableHead className={cx(styles.profilesHeader)}>
        <TableRow>
          <TableCell style={{ width: "32%" }}>
            <TextField 
              autoFocus 
              value={newElement.title || ''} 
              onChange={(e) => setNewElement({...newElement, title: e.target.value})} 
              error={newElementIsInvalid} 
              fullWidth 
              variant="outlined" 
              placeholder="New Profile Name"
            />
          </TableCell>
          <TableCell style={{ width: "21%" }} align="right">
            <TextField
              className={cx(styles.numericField)} 
              value={newElement.downloadKps || ''} 
              onChange={(e) => setNewElement({...newElement, downloadKps: e.target.value})} 
              fullWidth 
              variant="outlined" 
              placeholder="Kb/s (optional)"
              InputProps={{
                inputComponent: NumberFormatCustom,
              }}
            />
          </TableCell>
          <TableCell style={{ width: "21%" }} align="right">
            <TextField
              className={cx(styles.numericField)} 
              value={newElement.uploadKps || ''} 
              onChange={(e) => setNewElement({...newElement, uploadKps: e.target.value})} 
              fullWidth 
              variant="outlined" 
              placeholder="Kb/s (optional)"
              InputProps={{
                inputComponent: NumberFormatCustom,
              }}
            />
          </TableCell>
          <TableCell style={{ width: "21%" }} align="right">
            <TextField
              className={cx(styles.numericField)} 
              value={newElement.latencyMs || ''} 
              onChange={(e) => setNewElement({...newElement, latencyMs: e.target.value})} 
              fullWidth 
              variant="outlined" 
              placeholder="ms (optional)"
              InputProps={{
                inputComponent: NumberFormatCustom,
              }}
            />
          </TableCell>
          <TableCell style={{ width: "5%" }} align="right">
            <AddCircleOutlineOutlinedIcon className={cx(styles.actionIcon)} onClick={addNewElement} />
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
