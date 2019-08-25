import React from 'react';
import Select from 'react-select';
import {
  HORIZONTAL_LAYOUT,
  FLEXIGRID_LAYOUT,
} from '../../constants/previewerLayouts';

const options = [
  {value: HORIZONTAL_LAYOUT, label: 'Horizontal'},
  {value: FLEXIGRID_LAYOUT, label: 'FlexiGrid'},
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
  menu: styles => ({...styles, background: '#ffffff10'}),
};

export default function PreviewerLayoutSelector(props) {
  return (
    <Select
      options={options}
      value={options.find(option => option.value === props.value)}
      onChange={props.onChange}
      styles={styles}
    />
  );
}
