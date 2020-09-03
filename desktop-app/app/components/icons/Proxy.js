import React, {Fragment} from 'react';

export default ({width, height, color, padding, margin}) => (
  <Fragment>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink" 
		version="1.1"
        x="0px"
        y="0px"
        height={height}
        width={width}
        fill={color}
        style={{padding, margin}}
		className="proxyIcon"
		viewBox="0 0 34.5 34.5"
	>
		<g className="currentLayer">
			<title>Layer 1</title>
			<path d="M30 30h-8v-8h8zm-6-2h4v-4h-4z" fill="currentColor" id="svg_1"/>
			<path d="M20 27H8a6 6 0 0 1 0-12h2v2H8a4 4 0 0 0 0 8h12z" fill="currentColor" id="svg_2"/>
			<path d="M20 20h-8v-8h8zm-6-2h4v-4h-4z" fill="currentColor" id="svg_3"/>
			<path d="M24 17h-2v-2h2a4 4 0 0 0 0-8H12V5h12a6 6 0 0 1 0 12z" fill="currentColor" id="svg_4"/>
			<path d="M10 10H2V2h8zM4 8h4V4H4z" fill="currentColor" id="svg_5"/>
			<rect fill="currentColor" strokeDashoffset="" fillRule="nonzero" id="svg_6" x="13" y="13" width="7" height="7"/>
		</g>
	</svg>
  </Fragment>
);
