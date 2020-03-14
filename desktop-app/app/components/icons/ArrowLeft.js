import React, {Fragment} from 'react';

export default ({width, height, color, padding, margin}) => (
    <Fragment>
        <svg
            height={height}
            width={width}
            fill={color}
            style={{padding, margin}}
            xmlns="http://www.w3.org/2000/svg"
            data-name="Layer 1"
            viewBox="0 0 24 24"
        >
            <path d="M17,11H9.41l3.3-3.29a1,1,0,1,0-1.42-1.42l-5,5a1,1,0,0,0-.21.33,1,1,0,0,0,0,.76,1,1,0,0,0,.21.33l5,5a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L9.41,13H17a1,1,0,0,0,0-2Z" />
        </svg>
    </Fragment>
);
