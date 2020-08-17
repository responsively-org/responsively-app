import React from 'react';

const UrlSearchResults = ({
  divClassName,
  listItemsClassName,
  filteredSearchResults,
  cursorIndex,
  handleUrlChange,
  activeClass,
  listItemUiClassName,
  pageMetaIconClassName,
  pageMetaIconWrapperClassName,
  searchBarSuggestionUrlClassName,
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
            <li key={index}>
              <div
                className={`${listItemsClassName} ${
                  cursorIndex === index ? activeClass : ''
                }`}
                onClick={() => handleUrlChange(eachResult.url, index)}
              >
                <div className={pageMetaIconWrapperClassName}>
                  {favicon && (
                    <img
                      className={pageMetaIconClassName}
                      src={favicon}
                      onError={event => (event.target.style.display = 'none')}
                    />
                  )}
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
