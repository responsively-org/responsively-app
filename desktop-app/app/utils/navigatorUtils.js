import settings from 'electron-settings';
import path from 'path';
import {addUrlToSearchResults,getExistingSearchResults,deleteSearchResults} from '../settings/urlSearchResultSettings';

const HOME_PAGE = 'HOME_PAGE';
const LAST_OPENED_ADDRESS = 'LAST_OPENED_ADDRESS';

export function saveHomepage(url) {
  settings.set(HOME_PAGE, url);
}

export function saveLastOpenedAddress(url) {
  settings.set(LAST_OPENED_ADDRESS, url);
}

export function getHomepage() {
  return settings.get(HOME_PAGE) || 'https://www.google.com/';
}

export function getLastOpenedAddress() {
  return settings.get(LAST_OPENED_ADDRESS) || getHomepage();
}

export function addUrlToExistingSearchResult(existingSearchResults,url){
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
