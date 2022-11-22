import React, {useMemo} from 'react';
import {useTheme} from '@material-ui/core/styles';
import LayoutIcon from '../icons/Layout';
import {
  HORIZONTAL_LAYOUT,
  FLEXIGRID_LAYOUT,
  INDIVIDUAL_LAYOUT,
} from '../../constants/previewerLayouts';
import Select from '../Select';
import useCommonStyles from '../useCommonStyles';

function PreviewerLayoutSelector(props) {
  const theme = useTheme();
  const commonClasses = useCommonStyles();
  const selectedOption = useMemo(
    () => options.find(option => option.value === props.value),
    [props.value]
  );

  return (
    <div className={commonClasses.sidebarContentSection}>
      <div className={commonClasses.sidebarContentSectionTitleBar}>
        <LayoutIcon height={18} margin={6} color={theme.palette.text.primary} />
        Layout
      </div>
      <div className={commonClasses.sidebarContentSectionContainer}>
        <Select
          options={options}
          value={selectedOption}
          onChange={props.onChange}
        />
      </div>
    </div>
  );
}

const options = [
  {value: HORIZONTAL_LAYOUT, label: 'Horizontal'},
  {value: FLEXIGRID_LAYOUT, label: 'FlexiGrid'},
  {value: INDIVIDUAL_LAYOUT, label: 'Individual'},
];

export default PreviewerLayoutSelector;
