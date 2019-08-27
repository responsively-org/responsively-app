DomInspector
--------------------------------

Dom inspector like chrome dev tools.

![](https://s10.mogucdn.com/mlcdn/c45406/180622_884j6ci4c4j747e3j3eihiilbif43_736x472.gif)

## Usage

#### Install `dom-inspector`

```bash
npm install dom-inspector --save
```

```html
<script type="text/javascript" src="./dist/dom-inspector.min.js"></script>
```

```js
const DomInspector = require('dom-inspector');
```

```js
import DomInspector from 'dom-inspector';
```

#### New instance

```js
const inspector = new DomInspector();
```

#### Instance options

```js
const inspector = new DomInspector({
	root: 'body',
	exclude: ['#exclude>div', document.querySelector('.exclude')],
	theme: 'you-custom-theme-class'
});
```

* root

	Dom inspector root element. `String` or `Dom`, default `body`.

* exclude

	Not inspect some elements. `String` or `Dom` Array.

* theme

	Inspector overlay style. You can custom overlay background color as follow.

	```css
	.you-custom-theme-class .margin {
		background-color: blue;
	}

	.you-custom-theme-class .border {
		background-color: red;
	}

	.you-custom-theme-class .padding {
		background-color: green;
	}

	.you-custom-theme-class .content {
		background-color: gray;
	}

	```

	Don`t forget background color opacity. ^_^

#### Attribute list

* `inspector.target`

	Inspecting element.

#### API list

* `inspector.enable()`

	Display overlay `block` and addEventListener `mousemove`.

* `inspector.pause()`

	RemoveEventListener `mousemove`, pause inspector.

* `inspector.disable()`

	RemoveEventListener `mousemove`, display overlay `none`.

* `inspector.destroy()`

	`disable()` and remove overlay.

* `inspector.getXPath([ele])`

	Return ele XPath.

* `inspector.getSelector([ele])`

	Return ele selector.
	
	`html>body>div:nth-of-type(9)`

* `inspector.getElementInfo([ele])`

	```js
	return {
		top: '',
		left: '',
		width: '',
		height: '',
		'padding-top': '',
		'padding-right': '',
		'padding-bottom': '',
		'padding-left': '',
		'border-top-width': '',
		'border-right-width': '',
		'border-bottom-width': '',
		'border-left-width': '',
		'margin-top': '',
		'margin-right': '',
		'margin-bottom': '',
		'margin-left': ''
	};
	```
