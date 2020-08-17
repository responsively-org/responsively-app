import React from 'react';
import DefaultFavIcon from '@material-ui/icons/Public';

const UrlSearchResults = ({
  divClassName,
  listItemsClassName,
  filteredSearchResults,
  cursorIndex,
  handleUrlChange,
  activeClass,
  listItemUiClassName,
  pageMetaFavIconClassName,
  pageMetaFavIconWrapperClassName,
  searchBarSuggestionUrlClassName,
  pageMetaDefaultFavIconWrapperClassName,
}) => (
  <div className={divClassName}>
    <ul className={listItemUiClassName}>
      {filteredSearchResults?.map((eachResult, index) => {
        const favicon = eachResult.pageMeta?.favicons?.[0];
        const title = eachResult.pageMeta?.title;
        const url = eachResult.url;
        const searchBarSuggestion = `${title ? `${title} - ` : ''} ${url}`;
        return (
          index < 8 && (
            <li key={url}>
              <div
                className={`${listItemsClassName} ${
                  cursorIndex === index ? activeClass : ''
                }`}
                onClick={() => handleUrlChange(eachResult.url, index)}
              >
                <div className={pageMetaFavIconWrapperClassName}>
                  {favicon ? (
                    <img
                      className={pageMetaFavIconClassName}
                      src={favicon}
                      onError={event => {
                        event.target.style.display = 'none';
                        event.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <div className={pageMetaDefaultFavIconWrapperClassName}>
                      <DefaultFavIcon fontSize="inherit" />
                    </div>
                  )}
                  <div
                    style={{display: 'none'}}
                    className={pageMetaDefaultFavIconWrapperClassName}
                  >
                    <DefaultFavIcon fontSize="inherit" />
                  </div>
                </div>
                <span className={searchBarSuggestionUrlClassName}>
                  {searchBarSuggestion}
                </span>
              </div>
            </li>
          )
        );
      })}
    </ul>
  </div>
);

export default UrlSearchResults;
