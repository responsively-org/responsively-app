import {
  $,
  getElementInfo,
  isDOM,
  addRule,
  findIndex,
  getMaxZIndex,
  isParent,
} from './dom.js';
import {throttle, isNull} from './utils.js';
import logger from './logger.js';

class DomInspector {
  constructor(options = {}) {
    this._doc = window.document;

    this.root = options.root
      ? isDOM(options.root)
        ? options.root
        : $(options.root)
      : $('body');

    if (isNull(this.root)) {
      logger.warn('Root element is null. Auto select body as root');
      this.root = $('body');
    }

    this.theme = options.theme || 'dom-inspector-theme-default';
    this.exclude = this._formatExcludeOption(options.exclude || []);

    this.overlay = {};
    this.overlayId = '';
    this.target = '';
    this.destroyed = false;

    this._cachedTarget = '';
    this._throttleOnMove = throttle(this._onMove.bind(this), 100);

    this._init();
  }

  enable() {
    if (this.destroyed) {
      return logger.warn(
        'Inspector instance has been destroyed! Please redeclare it.'
      );
    }
    this.overlay.parent.style.display = 'block';
    this.root.addEventListener('mousemove', this._throttleOnMove);
  }

  pause() {
    this.root.removeEventListener('mousemove', this._throttleOnMove);
  }

  disable() {
    this.overlay.parent.style.display = 'none';
    this.overlay.parent.style.width = 0;
    this.overlay.parent.style.height = 0;
    this.target = null;
    this.root.removeEventListener('mousemove', this._throttleOnMove);
  }

  destroy() {
    this.destroyed = true;
    this.disable();
    this.overlay = {};
  }

  getXPath(ele) {
    if (!isDOM(ele) && !this.target) {
      return logger.warn(
        'Target element is not found. Warning function name:%c getXPath',
        'color: #ff5151'
      );
    }
    if (!ele) ele = this.target;

    if (ele.hasAttribute('id')) {
      return `//${ele.tagName.toLowerCase()}[@id="${ele.id}"]`;
    }

    if (ele.hasAttribute('class')) {
      return `//${ele.tagName.toLowerCase()}[@class="${ele.getAttribute(
        'class'
      )}"]`;
    }

    const path = [];
    while (ele.nodeType === Node.ELEMENT_NODE) {
      const currentTag = ele.nodeName.toLowerCase();
      const nth = findIndex(ele, currentTag);
      path.push(`${ele.tagName.toLowerCase()}${nth === 1 ? '' : `[${nth}]`}`);
      ele = ele.parentNode;
    }
    return `/${path.reverse().join('/')}`;
  }

  getSelector(ele) {
    if (!isDOM(ele) && !this.target) {
      return logger.warn(
        'Target element is not found. Warning function name:%c getCssPath',
        'color: #ff5151'
      );
    }
    if (!ele) ele = this.target;
    const path = [];
    while (ele.nodeType === Node.ELEMENT_NODE) {
      let currentSelector = ele.nodeName.toLowerCase();
      if (ele.hasAttribute('id')) {
        currentSelector += `#${ele.id}`;
      } else {
        const nth = findIndex(ele, currentSelector);
        if (nth !== 1) currentSelector += `:nth-of-type(${nth})`;
      }
      path.unshift(currentSelector);
      ele = ele.parentNode;
    }
    return path.join('>');
  }

  getElementInfo(ele) {
    if (!isDOM(ele) && !this.target) {
      return logger.warn(
        'Target element is not found. Warning function name:%c getElementInfo',
        'color: #ff5151'
      );
    }
    return getElementInfo(ele || this.target);
  }

  _initStyles() {
    const css = `
			.dom-inspector {
				position: fixed;
				pointer-events: none;
			}
			
			.dom-inspector>div {
				position: absolute;
			}
			
			.dom-inspector .tips {
				background-color: #333740;
				font-size: 0;
				line-height: 18px;
				padding: 3px 10px;
				position: fixed;
				border-radius: 4px;
				display: none;
			}
			
			.dom-inspector .tips.reverse{
			
			}
			
			.dom-inspector .tips .triangle {
				width: 0;
				height: 0;
				position: absolute;
				border-top: 8px solid #333740;
				border-right: 8px solid transparent;
				border-bottom: 8px solid transparent;
				border-left: 8px solid transparent;
				left: 10px;
				top: 24px;
			}
			
			.dom-inspector .tips.reverse .triangle {
				border-top: 8px solid transparent;
				border-right: 8px solid transparent;
				border-bottom: 8px solid #333740;
				border-left: 8px solid transparent;
				left: 10px;
				top: -16px;
			}
			
			.dom-inspector .tips>div {
				display: inline-block;
				vertical-align: middle;
				font-size: 12px;
				font-family: Consolas, Menlo, Monaco, Courier, monospace;
				overflow: auto;
			}
			
			.dom-inspector .tips .tag {
				color: #e776e0;
			}
			
			.dom-inspector .tips .id {
				color: #eba062;
			}
			
			.dom-inspector .tips .class {
				color: #8dd2fb;
			}
			
			.dom-inspector .tips .line {
				color: #fff;
			}
			
			.dom-inspector .tips .size {
				color: #fff;
			}
			
			.dom-inspector-theme-default {
			
			}
			
			.dom-inspector-theme-default .margin {
        background-color: rgba(246, 178, 107, 0.66);
      }
      
      .dom-inspector-theme-default .border {
        background-color: rgba(255, 229, 153, 0.66);
      }
      
      .dom-inspector-theme-default .padding {
        background-color: rgba(147, 196, 125, 0.55);
      }
      
      .dom-inspector-theme-default .content {
        background-color: rgba(111, 168, 220, 0.66);
      }
		`;
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  _init() {
    this._initStyles();
    this.overlayId = `dom-inspector-${Date.now()}`;

    const parent = this._createElement('div', {
      id: this.overlayId,
      class: `dom-inspector ${this.theme}`,
      style: `z-index: ${getMaxZIndex() + 1}`,
    });

    this.overlay = {
      parent,
      content: this._createSurroundEle(parent, 'content'),
      paddingTop: this._createSurroundEle(parent, 'padding padding-top'),
      paddingRight: this._createSurroundEle(parent, 'padding padding-right'),
      paddingBottom: this._createSurroundEle(parent, 'padding padding-bottom'),
      paddingLeft: this._createSurroundEle(parent, 'padding padding-left'),
      borderTop: this._createSurroundEle(parent, 'border border-top'),
      borderRight: this._createSurroundEle(parent, 'border border-right'),
      borderBottom: this._createSurroundEle(parent, 'border border-bottom'),
      borderLeft: this._createSurroundEle(parent, 'border border-left'),
      marginTop: this._createSurroundEle(parent, 'margin margin-top'),
      marginRight: this._createSurroundEle(parent, 'margin margin-right'),
      marginBottom: this._createSurroundEle(parent, 'margin margin-bottom'),
      marginLeft: this._createSurroundEle(parent, 'margin margin-left'),
      tips: this._createSurroundEle(
        parent,
        'tips',
        '<div class="tag"></div><div class="id"></div><div class="class"></div><div class="line">&nbsp;|&nbsp;</div><div class="size"></div><div class="triangle"></div>'
      ),
    };

    $('body').appendChild(parent);
  }

  _createElement(tag, attr, content) {
    const ele = this._doc.createElement(tag);
    Object.keys(attr).forEach(item => {
      ele.setAttribute(item, attr[item]);
    });
    if (content) ele.innerHTML = content;
    return ele;
  }

  _createSurroundEle(parent, className, content) {
    const ele = this._createElement(
      'div',
      {
        class: className,
      },
      content
    );
    parent.appendChild(ele);
    return ele;
  }

  _onMove(e) {
    for (let i = 0; i < this.exclude.length; i += 1) {
      const cur = this.exclude[i];
      if (cur.isEqualNode(e.target) || isParent(e.target, cur)) return;
    }

    this.target = e.target;

    if (this.target === this._cachedTarget) return null;

    this._cachedTarget = this.target;
    const elementInfo = getElementInfo(e.target);
    const contentLevel = {
      width: elementInfo.width,
      height: elementInfo.height,
    };
    const paddingLevel = {
      width:
        elementInfo['padding-left'] +
        contentLevel.width +
        elementInfo['padding-right'],
      height:
        elementInfo['padding-top'] +
        contentLevel.height +
        elementInfo['padding-bottom'],
    };
    const borderLevel = {
      width:
        elementInfo['border-left-width'] +
        paddingLevel.width +
        elementInfo['border-right-width'],
      height:
        elementInfo['border-top-width'] +
        paddingLevel.height +
        elementInfo['border-bottom-width'],
    };
    const marginLevel = {
      width:
        elementInfo['margin-left'] +
        borderLevel.width +
        elementInfo['margin-right'],
      height:
        elementInfo['margin-top'] +
        borderLevel.height +
        elementInfo['margin-bottom'],
    };

    // so crazy
    addRule(this.overlay.parent, {
      width: `${marginLevel.width}px`,
      height: `${marginLevel.height}px`,
      top: `${elementInfo.top}px`,
      left: `${elementInfo.left}px`,
    });
    addRule(this.overlay.content, {
      width: `${contentLevel.width}px`,
      height: `${contentLevel.height}px`,
      top: `${elementInfo['margin-top'] +
        elementInfo['border-top-width'] +
        elementInfo['padding-top']}px`,
      left: `${elementInfo['margin-left'] +
        elementInfo['border-left-width'] +
        elementInfo['padding-left']}px`,
    });
    addRule(this.overlay.paddingTop, {
      width: `${paddingLevel.width}px`,
      height: `${elementInfo['padding-top']}px`,
      top: `${elementInfo['margin-top'] + elementInfo['border-top-width']}px`,
      left: `${elementInfo['margin-left'] +
        elementInfo['border-left-width']}px`,
    });
    addRule(this.overlay.paddingRight, {
      width: `${elementInfo['padding-right']}px`,
      height: `${paddingLevel.height - elementInfo['padding-top']}px`,
      top: `${elementInfo['padding-top'] +
        elementInfo['margin-top'] +
        elementInfo['border-top-width']}px`,
      right: `${elementInfo['margin-right'] +
        elementInfo['border-right-width']}px`,
    });
    addRule(this.overlay.paddingBottom, {
      width: `${paddingLevel.width - elementInfo['padding-right']}px`,
      height: `${elementInfo['padding-bottom']}px`,
      bottom: `${elementInfo['margin-bottom'] +
        elementInfo['border-bottom-width']}px`,
      right: `${elementInfo['padding-right'] +
        elementInfo['margin-right'] +
        elementInfo['border-right-width']}px`,
    });
    addRule(this.overlay.paddingLeft, {
      width: `${elementInfo['padding-left']}px`,
      height: `${paddingLevel.height -
        elementInfo['padding-top'] -
        elementInfo['padding-bottom']}px`,
      top: `${elementInfo['padding-top'] +
        elementInfo['margin-top'] +
        elementInfo['border-top-width']}px`,
      left: `${elementInfo['margin-left'] +
        elementInfo['border-left-width']}px`,
    });
    addRule(this.overlay.borderTop, {
      width: `${borderLevel.width}px`,
      height: `${elementInfo['border-top-width']}px`,
      top: `${elementInfo['margin-top']}px`,
      left: `${elementInfo['margin-left']}px`,
    });
    addRule(this.overlay.borderRight, {
      width: `${elementInfo['border-right-width']}px`,
      height: `${borderLevel.height - elementInfo['border-top-width']}px`,
      top: `${elementInfo['margin-top'] + elementInfo['border-top-width']}px`,
      right: `${elementInfo['margin-right']}px`,
    });
    addRule(this.overlay.borderBottom, {
      width: `${borderLevel.width - elementInfo['border-right-width']}px`,
      height: `${elementInfo['border-bottom-width']}px`,
      bottom: `${elementInfo['margin-bottom']}px`,
      right: `${elementInfo['margin-right'] +
        elementInfo['border-right-width']}px`,
    });
    addRule(this.overlay.borderLeft, {
      width: `${elementInfo['border-left-width']}px`,
      height: `${borderLevel.height -
        elementInfo['border-top-width'] -
        elementInfo['border-bottom-width']}px`,
      top: `${elementInfo['margin-top'] + elementInfo['border-top-width']}px`,
      left: `${elementInfo['margin-left']}px`,
    });
    addRule(this.overlay.marginTop, {
      width: `${marginLevel.width}px`,
      height: `${elementInfo['margin-top']}px`,
      top: 0,
      left: 0,
    });
    addRule(this.overlay.marginRight, {
      width: `${elementInfo['margin-right']}px`,
      height: `${marginLevel.height - elementInfo['margin-top']}px`,
      top: `${elementInfo['margin-top']}px`,
      right: 0,
    });
    addRule(this.overlay.marginBottom, {
      width: `${marginLevel.width - elementInfo['margin-right']}px`,
      height: `${elementInfo['margin-bottom']}px`,
      bottom: 0,
      right: `${elementInfo['margin-right']}px`,
    });
    addRule(this.overlay.marginLeft, {
      width: `${elementInfo['margin-left']}px`,
      height: `${marginLevel.height -
        elementInfo['margin-top'] -
        elementInfo['margin-bottom']}px`,
      top: `${elementInfo['margin-top']}px`,
      left: 0,
    });

    $('.tag', this.overlay.tips).innerHTML = this.target.tagName.toLowerCase();
    $('.id', this.overlay.tips).innerHTML = this.target.id
      ? `#${this.target.id}`
      : '';
    $('.class', this.overlay.tips).innerHTML = [...this.target.classList]
      .map(item => `.${item}`)
      .join('');
    $(
      '.size',
      this.overlay.tips
    ).innerHTML = `${marginLevel.width}x${marginLevel.height}`;

    let tipsTop = 0;
    if (elementInfo.top >= 24 + 8) {
      this.overlay.tips.classList.remove('reverse');
      tipsTop = elementInfo.top - 24 - 8;
    } else {
      this.overlay.tips.classList.add('reverse');
      tipsTop = marginLevel.height + elementInfo.top + 8;
    }
    addRule(this.overlay.tips, {
      top: `${tipsTop}px`,
      left: `${elementInfo.left}px`,
      display: 'block',
    });
  }

  _formatExcludeOption(excludeArray = []) {
    const result = [];

    excludeArray.forEach(item => {
      if (typeof item === 'string') return result.push($(item));

      if (isDOM(item)) return result.push(item);
    });

    return result;
  }
}

export default DomInspector;
