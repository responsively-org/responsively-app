const sep = 'DomInspector: ';

const proxy = ['log', 'warn', 'error'];

const exportObj = {};

proxy.forEach(item => {
	exportObj[item] = function funcName(...args) {
		return console[item].call(this, sep + args[0], args[1] || '');
	};
});

export default exportObj;
