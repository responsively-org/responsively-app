import React from 'react';
import cx from 'classnames';
import Select from 'react-select';
import LayoutIcon from '../icons/Layout';
import {
  HORIZONTAL_LAYOUT,
  FLEXIGRID_LAYOUT,
  INDIVIDUAL_LAYOUT,
} from '../../constants/previewerLayouts';

import commonStyles from '../common.styles.css';

const options = [
  {value: HORIZONTAL_LAYOUT, label: 'Horizontal'},
  {value: FLEXIGRID_LAYOUT, label: 'FlexiGrid'},
  {value: INDIVIDUAL_LAYOUT, label: 'Individual'},
];

const styles = {
  control: styles => ({...styles, backgroundColor: '#ffffff10'}),
  option: (styles, {data, isDisabled, isFocused, isSelected}) => {
    const color = 'white';
    return {
      ...styles,
      backgroundColor: isDisabled
        ? null
        : isSelected
        ? '#ffffff40'
        : isFocused
        ? '#ffffff20'
        : null,
      color: 'white',

      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled && '#ffffff40',
      },
    };
  },
  input: styles => ({...styles}),
  placeholder: styles => ({...styles}),
  singleValue: (styles, {data}) => ({...styles, color: 'white'}),
  menu: styles => ({...styles, background: '#4b4b4b', zIndex: 100}),
};

export default function PreviewerLayoutSelector(props) {
  return (
    <div className={cx(commonStyles.sidebarContentSection)}>
      <div className={cx(commonStyles.sidebarContentSectionTitleBar)}>
        <LayoutIcon height={18} margin={6} color="white" />
        Layout
      </div>
      <div className={cx(commonStyles.sidebarContentSectionContainer)}>
        <Select
          options={options}
          value={options.find(option => option.value === props.value)}
          onChange={props.onChange}
          styles={styles}
        />
      </div>
    </div>
  );
}
