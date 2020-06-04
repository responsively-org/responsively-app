import React from 'react';
import cx from 'classnames'
import FavIcon from '@material-ui/icons/Star';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import commonStyles from '../common.styles.css'

export default function BookmarksDrawer({bookmarks, gotoUrl}) {
  return (
    <div className={cx(commonStyles.sidebarContentSection)}>
      <div className={cx(commonStyles.sidebarContentSectionTitleBar)}>
        <FavIcon width={26} margin={2} /> Bookmarks
      </div>
      <div className={cx(commonStyles.sidebarContentSectionContainer)}>
        <div>
          <List component="nav" dense={true}>
            {bookmarks.map(bookmark => (
              <ListItem button onClick={() => gotoUrl(bookmark.url)}>
                <ListItemText primary={bookmark.title} />
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    </div>
  );
}
