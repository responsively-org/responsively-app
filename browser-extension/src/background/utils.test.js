import {expect} from 'chai';
import {processCSPHeader} from './utils';

describe('background/utils', () => {
  describe('processCSPHeader', () => {
    const extensionURL = 'chrome-extension://ahichoemcjmdgdojboecnokgfolkmfmo/';
    
    it('should return the frame-accessor director if the response header is null', () => {  
      const result = processCSPHeader(null, extensionURL);
      expect(result).to.be.equals(`frame-ancestors ${extensionURL}`);
    });

    it('should return the frame-accessor directive in addition to the existing directives', () => {
      const oldValue = "default-src 'self';"
      const result = processCSPHeader({name: 'Content-Security-Policy', value: oldValue}, extensionURL);
      expect(result).to.be.equals(`${oldValue} frame-ancestors ${extensionURL}`);
    });

    it('should append the current source the existing frame-accessor directive', () => {
      const oldValue = "upgrade-insecure-requests; frame-ancestors 'self' https://stackexchange.com"
      const result = processCSPHeader({name: 'Content-Security-Policy', value: oldValue}, extensionURL);
      expect(result).to.be.equals(`${oldValue} ${extensionURL}`);
    });

  });
});

