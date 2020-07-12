import React from 'react';
import filter from 'lodash/filter';
import settings from 'electron-settings';
import {ADD_SEARCH_RESULTS} from '../../constants/searchResultSettings';

let previousSearchResults = settings.get(ADD_SEARCH_RESULTS);

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


export const searchUrlUtils = (url) => {
  const filteredData = filter(previousSearchResults, (eachResult) => eachResult.url.toLowerCase().includes(url));
  let finalResult = _sortedExistingUrlSearchResult(filteredData);
  return finalResult;
}

export const updateExistingUrl = (url )=> {
  if(previousSearchResults?.length){
   let updatedSearchResults = [...previousSearchResults];

   const index = updatedSearchResults.findIndex(eachSearchResult => eachSearchResult.url === url);

   index!== (undefined|| -1 || null) ? updatedSearchResults[index].visitedCount = updatedSearchResults[index].visitedCount+1 :
          updatedSearchResults.push({url: url,visitedCount:1})

   addUrlToSearchResults(updatedSearchResults);
   previousSearchResults = updatedSearchResults;

  }

  else {
    let addNewUrl = [];
      addNewUrl.push({
        url: url,
        visitedCount: 1
      });
    addUrlToSearchResults(addNewUrl);
    previousSearchResults = addNewUrl;
  }
}



