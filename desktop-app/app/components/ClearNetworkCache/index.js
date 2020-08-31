import React from 'react';
import cx from 'classnames';
import Button from '@material-ui/core/Button';
import CachedIcon from '@material-ui/icons/Cached';
import useCommonStyles from '../useCommonStyles';

function ClearNetworkCache(props) {
  const commonClasses = useCommonStyles();

  return (
    <div className={commonClasses.sidebarContentSection}>
      <div className={commonClasses.sidebarContentSectionTitleBar}>
        <CachedIcon style={{marginRight: 5}} /> Network Cache
      </div>
      <div className={commonClasses.sidebarContentSectionContainer}>
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

export default ClearNetworkCache;
