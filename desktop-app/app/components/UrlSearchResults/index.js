import React from 'react';
import cx from 'classnames';
import styles from './style.css';
import DefaultFavIcon from '@material-ui/icons/Public';

const UrlSearchResults = ({
  filteredSearchResults,
  cursorIndex,
  handleUrlChange,
}) => (
  <div className={cx(styles.searchBarSuggestionsContainer)}>
    <ul className={cx(styles.searchBarSuggestionsListUl)}>
      {filteredSearchResults?.map((eachResult, index) => {
        const favicon = eachResult.pageMeta?.favicons?.[0];
        const title = eachResult.pageMeta?.title;
        const url = eachResult.url;
        return (
          index < 8 && (
            <li key={url}>
              <div
                className={cx(styles.searchBarSuggestionsListItems, {
                  [styles.searchBarSuggestionsActiveListItems]:
                    cursorIndex === index,
                })}
                onClick={() => handleUrlChange(eachResult.url, index)}
              >
                <div className={cx(styles.pageFavIconWrapper)}>
                  {favicon ? (
                    <img
                      className={cx(styles.pageFavIcon)}
                      src={favicon}
                      onError={event => {
                        event.target.style.display = 'none';
                        event.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <div className={cx(styles.pageDefaultFavIconWrapper)}>
                      <DefaultFavIcon fontSize="inherit" />
                    </div>
                  )}
                  <div
                    style={{display: 'none'}}
                    className={cx(styles.pageDefaultFavIconWrapperClassName)}
                  >
                    <DefaultFavIcon fontSize="inherit" />
                  </div>
                </div>
                <div className={cx(styles.pageTitleAndUrlContainer)}>
                  <span className={cx(styles.pageTitle)}>{title}</span>
                  <span className={cx(styles.pageUrl)}>{url}</span>
                </div>
              </div>
            </li>
          )
        );
      })}
    </ul>
  </div>
);

export default UrlSearchResults;
