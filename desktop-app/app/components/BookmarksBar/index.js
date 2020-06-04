// @flow
import React from 'react';
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import styles from './style.css';

export const BookmarksBar = function ({bookmarks, gotoUrl}) {
  console.log(gotoUrl)
  return <Grid container direction="row" justify="flex-start" alignItems="center" className={styles.bookmarks} spacing={1}>
    {bookmarks.map(bookmark => (
      <Grid item onClick={() => gotoUrl(bookmark.url)} key={bookmark.url}>
        <Button size="small">{bookmark.title}</Button>
      </Grid>
    ))}
    </Grid>
}
