import openCustomProtocolURI from 'custom-protocol-check';

openCustomProtocolURI(`responsively123://${window.location.href}`, () => {
  console.log('Failed');
}, () => {
  console.log('Success');
})