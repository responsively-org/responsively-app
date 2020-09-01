import React, {useEffect, useState} from 'react';
import cx from 'classnames';
import {shell} from 'electron';
import useStyles from './useStyles';

const Announcement = () => {
  const [data, setData] = useState(null);
  const classes = useStyles();
  useEffect(() => {
    (async () => {
      try {
        const response = await (
          await fetch('https://responsively.app/assets/appMessages.json')
        ).json();
        setData(response.statusBarMessage);
      } catch (err) {
        console.log('Error fetching appMessages.json', err);
      }
    })();
  }, []);

  if (!data) {
    return null;
  }

  return (
    <div className={classes.section}>
      <div
        className={cx(classes.text, classes.link)}
        onClick={() => shell.openExternal(data.link)}
      >
        <span className={cx('featureSuggestionLink', classes.linkText)}>
          {data.text}
        </span>
      </div>
    </div>
  );
};

export default Announcement;
