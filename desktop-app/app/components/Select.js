import React, {useMemo} from 'react';
import ReactSelect from 'react-select';
import {useTheme} from '@material-ui/core/styles';
import useIsDarkTheme from './useIsDarkTheme';

function Select(props) {
  const appTheme = useTheme();
  const isDark = useIsDarkTheme();
  const styles = useMemo(() => ({
    control: styles => ({
      ...styles,
      backgroundColor: '#ffffff10',
      borderColor: isDark ? '#cccccc' : '#00000042',
    }),
    indicatorSeparator: styles => ({
      ...styles,
      backgroundColor: isDark ? '#cccccc' : '#00000042',
    }),
    dropdownIndicator: styles => ({
      ...styles,
      color: isDark ? '#cccccc' : '#00000042',
    }),
    option: (styles, {data, isDisabled, isFocused, isSelected}) => ({
      ...styles,
      backgroundColor: isDisabled
        ? null
        : isSelected
        ? appTheme.palette.background.l10
        : isFocused
        ? appTheme.palette.background.l5
        : null,
      color: appTheme.palette.text.normal,

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
    menu: styles => ({
      ...styles,
      background: appTheme.palette.background.l1,
      zIndex: 100,
    }),
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
