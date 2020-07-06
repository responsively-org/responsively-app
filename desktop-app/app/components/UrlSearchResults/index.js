import React from 'react';

const UrlSearchResults = ({
  divClassName,
  listItemsClassName,
  existingSearchResults,
  handleUrlChange,
  activeClass,
  listItemUiClassName
}) => {
  return(
     <div className = { divClassName }>
       <ul className={ listItemUiClassName }>
      {existingSearchResults?.map((eachResult,index)=>{
        return(
         <li onKeyDown={(e)=>handleOnKeyDown(e,eachResult.url)} key={ index } onClick={ ()=>handleUrlChange(eachResult.url,index) } className={ `${listItemsClassName}` }> { eachResult.url }</li>
        )
      })}
      </ul>
     </div>
  )
}
export default UrlSearchResults;
