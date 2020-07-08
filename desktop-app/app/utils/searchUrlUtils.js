import React from 'react';
import filter from 'lodash/filter';

const _sortedExistingUrlSearchResult = (filteredData) => { //Most visited site should appear first in the list
  filteredData.sort((a, b)=> {
     if(a.visitedCount > b.visitedCount){
       return -1
     }
     else if(a.visitedCount < b.visitedCount){
       return 1
     }
     return 0;
  });

   return filteredData;

}

export const searchUrlUtils = (existingUrl,url) => {
  const filteredData = filter(existingUrl, (eachResult) => eachResult.url.toLowerCase().includes(url));
  let finalResult = _sortedExistingUrlSearchResult(filteredData);
  return finalResult;
}



