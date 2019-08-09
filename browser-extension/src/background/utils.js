export function processCSPHeader(header, extensionURL) {
  const defaultFrameAccessor = `frame-ancestors ${extensionURL}`;
  if (!header || !header.value) {
    return defaultFrameAccessor;
  }
  const directives = header.value.split(';').map(value => value.trim()).filter(value => value.length);
  const frameAccessorDirective = directives.filter(directive => directive.indexOf('frame-ancestors') === 0)[0];
  if (!frameAccessorDirective) {
    return [...directives, defaultFrameAccessor].join('; ');
  }
  const frameAccessorDirectiveValues = frameAccessorDirective.split(' ').map(value => value.trim()).filter(value => value.length);
  frameAccessorDirectiveValues.push(extensionURL);
  const nonFrameAccessorDirectives = directives.filter(directive => directive.indexOf('frame-ancestors') === -1);
  return [...nonFrameAccessorDirectives, frameAccessorDirectiveValues.join(' ')].join('; ');
}