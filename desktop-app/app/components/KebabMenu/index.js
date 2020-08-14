import React, {useState, useRef} from 'react';
import Kebab from '../icons/Kebab';
import {iconsColor, themeColor} from '../../constants/colors';

import styles from './styles.module.css';
import {useClickAway} from 'react-use';

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
            <div className={styles.menu} onClick={() => setMouseOn(false)}>
              {children.map((child, idx) => (
                <div className={styles.option} key={idx}>
                  {child}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default KebabMenu;
