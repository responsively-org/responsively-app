import React from 'react';

const UrlSearchResults = ({
  divClassName,
  listItemsClassName,
  existingSearchResults,
  handleUrlChange
}) => {
  return(
     <div className = { divClassName }>
      {existingSearchResults?.map((eachResult,index)=>{
        return(
         <p  onClick={ ()=>handleUrlChange(eachResult.url,index) } className={ listItemsClassName }> { eachResult.url }</p>
        )
      })}
     </div>
  )
}
export default UrlSearchResults;
