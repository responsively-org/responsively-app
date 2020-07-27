import React from 'react';

const UrlSearchResults = ({
  divClassName,
  listItemsClassName,
  filteredSearchResults,
  cursorIndex,
  handleUrlChange,
  activeClass,
  listItemUiClassName,
}) => (
  <div className={divClassName}>
    <ul className={listItemUiClassName}>
      {filteredSearchResults?.map(
        (eachResult, index) =>
          index < 8 && (
            <li
              key={index}
              className={`${listItemsClassName} ${
                cursorIndex === index ? activeClass : ''
              }`}
            >
              <div onClick={() => handleUrlChange(eachResult.url, index)}>
                {eachResult.url}
              </div>
            </li>
          )
      )}
    </ul>
  </div>
);

export default UrlSearchResults;
