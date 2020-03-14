import React, {Fragment} from 'react';

export default ({width, height, color, padding, margin}) => (
    <Fragment>
        <svg
            height={height}
            width={width}
            fill={color}
            style={{padding, margin}}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
            x="0px"
            y="0px"
            viewBox="0 0 100 100"
            enableBackground="new 0 0 100 100"
        >
            <g>
                <path d="M91.414,88.586L70.815,67.987C76.522,61.614,80,53.207,80,44C80,24.149,63.851,8,44,8S8,24.149,8,44   s16.149,36,36,36c9.207,0,17.614-3.478,23.987-9.185l20.599,20.599C88.977,91.805,89.488,92,90,92s1.023-0.195,1.414-0.586   C92.195,90.633,92.195,89.367,91.414,88.586z M44,76c-17.645,0-32-14.355-32-32s14.355-32,32-32s32,14.355,32,32S61.645,76,44,76z" />
                <path d="M62,42H46V26c0-1.104-0.896-2-2-2s-2,0.896-2,2v16H26c-1.104,0-2,0.896-2,2s0.896,2,2,2h16v16   c0,1.104,0.896,2,2,2s2-0.896,2-2V46h16c1.104,0,2-0.896,2-2S63.104,42,62,42z" />
            </g>
        </svg>
    </Fragment>
);
