import React from 'react';
import filter from 'lodash/filter';
import settings from 'electron-settings';
import {ADD_SEARCH_RESULTS} from '../../constants/searchResultSettings';

export const getExistingSearchResults = () => {
  return settings.get(ADD_SEARCH_RESULTS);
}

const addUrlToSearchResults = (url)=>{
  return settings.set(ADD_SEARCH_RESULTS,url);
}

const deleteSearchResults = ()=> {
 settings.delete(ADD_SEARCH_RESULTS);
}


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

/* **
@params existingUrl,existingSearchResults is received from the function call
 */


export const searchUrlUtils = (existingUrl,url) => {
  const filteredData = filter(existingUrl, (eachResult) => eachResult.url.toLowerCase().includes(url));
  let finalResult = _sortedExistingUrlSearchResult(filteredData);
  return finalResult;
}

export const updateExistingUrl = (existingSearchResults,url )=> {
  if(existingSearchResults?.length){
   let updatedSearchResults = [...existingSearchResults];

   const index = updatedSearchResults.findIndex(eachSearchResult => eachSearchResult.url === url);

   index!== (undefined|| -1 || null) ? updatedSearchResults[index].visitedCount = updatedSearchResults[index].visitedCount+1 :
          updatedSearchResults.push({url: url,visitedCount:1})

   addUrlToSearchResults(updatedSearchResults);
   return updatedSearchResults;

  }

  else {
    let addNewUrl = [];
      addNewUrl.push({
        url: url,
        visitedCount: 1
      });
    addUrlToSearchResults(addNewUrl);
    return addNewUrl;
  }
}



