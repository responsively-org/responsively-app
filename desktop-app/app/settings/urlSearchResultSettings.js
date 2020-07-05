import React from 'react';
import settings from 'electron-settings';
import { ADD_SEARCH_RESULTS } from '../constants/searchResultSettings';


export const getExistingSearchResults = () => {
    return settings.get(ADD_SEARCH_RESULTS);
}

export const addUrlToSearchResults = (url)=>{
    return settings.set(ADD_SEARCH_RESULTS,url);
}

export const deleteSearchResults = ()=> {
   settings.delete(ADD_SEARCH_RESULTS);
}

