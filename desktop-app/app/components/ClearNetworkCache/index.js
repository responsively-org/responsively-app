import React from 'react';
import cx from 'classnames';
import Button from '@material-ui/core/Button';
import CachedIcon from '@material-ui/icons/Cached';

import commonStyles from '../common.styles.css';

export default function ClearNetworkCache(props) {
  return (
    <div className={cx(commonStyles.sidebarContentSection)}>
      <div className={cx(commonStyles.sidebarContentSectionTitleBar)}>
        <CachedIcon style={{marginRight: 5}} /> Network Cache
      </div>
      <div className={cx(commonStyles.sidebarContentSectionContainer)}>
        <Button
          variant="contained"
          color="primary"
          aria-label="clear network cache"
          component="span"
          onClick={() => props.onClearNetworkCache()}
        >
          Clear Network Cache
        </Button>
      </div>
    </div>
  );
}
