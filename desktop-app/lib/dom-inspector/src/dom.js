import { mixin } from './utils.js';

export function isDOM(obj = {}) {
	return (typeof obj === 'object') && (obj.nodeType === 1) && (typeof obj.style === 'object') && (typeof obj.ownerDocument === 'object');
}

export function $(selector, parent) {
	if (!parent) return document.querySelector(selector);
	if (isDOM(parent)) return parent.querySelector(selector);
	return document.querySelector(selector);
}

export function addRule(selector, cssObj) {
	Object.keys(cssObj).forEach(item => {
		selector.style[item] = cssObj[item];
	});
}

export function findIndex(ele, currentTag) {
	let nth = 0;
	while (ele) {
		if (ele.nodeName.toLowerCase() === currentTag) nth += 1;
		ele = ele.previousElementSibling;
	}
	return nth;
}

function findPos(ele) {
	let computedStyle = getComputedStyle(ele);
	let _x = ele.getBoundingClientRect().left - parseFloat(computedStyle['margin-left']);
	let _y = ele.getBoundingClientRect().top - parseFloat(computedStyle['margin-top']);
	let el = ele.parent;
	while (el) {
		computedStyle = getComputedStyle(el);
		_x += el.frameElement.getBoundingClientRect().left - parseFloat(computedStyle['margin-left']);
		_y += el.frameElement.getBoundingClientRect().top - parseFloat(computedStyle['margin-top']);
		el = el.parent;
	}
	return {
		top: _y,
		left: _x
	};
}

/**
 * @param  { Dom Element }
 * @return { Object }
 */
export function getElementInfo(ele) {
	const result = {};
	const requiredValue = [
		'border-top-width',
		'border-right-width',
		'border-bottom-width',
		'border-left-width',
		'margin-top',
		'margin-right',
		'margin-bottom',
		'margin-left',
		'padding-top',
		'padding-right',
		'padding-bottom',
		'padding-left',
		'z-index'
	];

	const computedStyle = getComputedStyle(ele);
	requiredValue.forEach(item => {
		result[item] = parseFloat(computedStyle[item]) || 0;
	});

	mixin(result, {
		width: ele.offsetWidth - result['border-left-width'] - result['border-right-width'] - result['padding-left'] - result['padding-right'],
		height: ele.offsetHeight - result['border-top-width'] - result['border-bottom-width'] - result['padding-top'] - result['padding-bottom']
	});
	mixin(result, findPos(ele));
	return result;
}

export function getMaxZIndex() {
	return [...document.all].reduce((r, e) => Math.max(r, +window.getComputedStyle(e).zIndex || 0), 0);
}

export function isParent(obj, parentObj) {
	while (obj !== undefined && obj !== null && obj.tagName.toUpperCase() !== 'BODY') {
		if (obj == parentObj) return true;
		obj = obj.parentNode;
	}
	return false;
}

export default $;
