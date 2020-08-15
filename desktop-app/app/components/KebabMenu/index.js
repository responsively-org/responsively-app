import React, {useState, useRef} from 'react';
import {useClickAway} from 'react-use';
import {motion} from 'framer-motion';

import Kebab from '../icons/Kebab';
import {iconsColor, themeColor} from '../../constants/colors';

import styles from './styles.module.css';

const KebabMenu = ({children}) => {
  const [mouseOn, setMouseOn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
        <div className={styles.icon} onClick={() => setShowMenu(!showMenu)}>
          <Kebab
            height={16}
            width={12}
            color={mouseOn || showMenu ? themeColor : iconsColor}
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
              className={styles.menu}
              onClick={() => setMouseOn(false)}
            >
              {children.map((child, idx) => (
                <motion.div className={styles.option} key={idx}>
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

export default KebabMenu;
