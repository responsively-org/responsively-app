const inspector = new DomInspector({
    root: 'body',
    exclude: ['.test111>span', document.querySelector('.exclude')],
});

const anotherInspector = new DomInspector({
    root: '.another',
});

// inspector.destroy();
inspector.enable();
anotherInspector.enable();
// inspector.getElementInfo();
// inspector.disable();

// inspector.target;

// inspector.getXPath(inspector.target);
// inspector.getCssPath(inspector.target);
// inspector.getSelector(inspector.target);
// inspector.getElementInfo(inspector.target);
