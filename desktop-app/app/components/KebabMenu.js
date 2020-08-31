import React, {useState, useRef} from 'react';
import {useClickAway} from 'react-use';
import {motion} from 'framer-motion';
import {useTheme, makeStyles} from '@material-ui/core/styles';
import Kebab from './icons/Kebab';

const KebabMenu = ({children}) => {
  const [mouseOn, setMouseOn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const theme = useTheme();
  const classes = useStyles();
  const menuRef = useRef();
  useClickAway(menuRef, () => {
    setShowMenu(false);
    setMouseOn(false);
  });

  if (children && !children.length) {
    children = [children];
  }

  return (
    <>
      <div
        onMouseEnter={() => setMouseOn(true)}
        onMouseLeave={() => setMouseOn(false)}
        ref={menuRef}
      >
        <div className={classes.icon} onClick={() => setShowMenu(!showMenu)}>
          <Kebab
            height={16}
            width={12}
            color={
              mouseOn || showMenu
                ? theme.palette.primary.main
                : theme.palette.text.primary
            }
          />
          {showMenu ? (
            <motion.div
              initial={{opacity: 0, height: 0}}
              animate={{opacity: 1, height: 'auto'}}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 1000,
              }}
              className={classes.menu}
              onClick={() => setMouseOn(false)}
            >
              {children.map((child, idx) => (
                <motion.div className={classes.option} key={idx}>
                  {child}
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </div>
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
  },
  menu: {
    position: 'absolute',
    width: 'max-content',
    top: '16px',
    right: 0,
    background: theme.palette.mode({
      light: theme.palette.grey[300],
      dark: '#313131',
    }),
    fontSize: '12px',
    zIndex: 1000,
    boxShadow: '5px 7px 5px 0 rgba(0, 0, 0, 0.75)',
    borderRadius: '5px',
  },
  option: {
    padding: '8px',
    '&:hover': {
      background: theme.palette.mode({
        light: theme.palette.grey[500],
        dark: 'black',
      }),
    },
    '&:first-child': {
      borderTopRightRadius: '5px',
      borderTopLeftRadius: '5px',
    },
    '&:last-child': {
      borderBottomRightRadius: '5px',
      borderBottomLeftRadius: '5px',
    },
  },
}));

export default KebabMenu;
