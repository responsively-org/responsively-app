import React, {useMemo} from 'react';
import ReactSelect from 'react-select';
import {useTheme} from '@material-ui/core/styles';

function Select(props) {
  const appTheme = useTheme();
  const styles = useMemo(() => ({
    control: styles => ({...styles, backgroundColor: '#ffffff10'}),
    option: (styles, {data, isDisabled, isFocused, isSelected}) => ({
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
    }),
    input: styles => ({...styles}),
    placeholder: styles => ({...styles}),
    singleValue: (styles, {data}) => ({
      ...styles,
      color: appTheme.palette.text.primary,
    }),
    menu: styles => ({...styles, background: '#4b4b4b', zIndex: 100}),
  }));

  return (
    <ReactSelect
      styles={styles}
      theme={theme => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: appTheme.palette.primary.main,
        },
      })}
      {...props}
    />
  );
}

export default Select;
