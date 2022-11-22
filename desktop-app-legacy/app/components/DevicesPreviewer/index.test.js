// @flow
import React from 'react';
import {shallow} from 'enzyme';
import {expect} from 'chai';

import DevicesPreviewer from '.';

const testSrc = 'https://testUrl.com';
const testDevice1 = {
  id: 1,
  name: 'testDevice1',
  width: 100,
  height: 100,
};
const testDevice2 = {
  id: 2,
  name: 'testDevice2',
  width: 200,
  height: 200,
};
const testDevices = [testDevice1, testDevice2];

describe('<DevicesPreviewer />', () => {
  it('Renders the Renderer for all passed array of devices', () => {
    const wrapper = shallow(
      <DevicesPreviewer devices={testDevices} url={testSrc} />
    );
    expect(wrapper.find('Renderer')).to.have.lengthOf(testDevices.length);
  });

  it('Renders the Renderer for all devices passed with the given url', () => {
    const wrapper = shallow(
      <DevicesPreviewer devices={testDevices} url={testSrc} />
    );
    wrapper.find('Renderer').forEach(renderer => {
      expect(renderer.prop('src')).to.equal(testSrc);
    });
  });

  it('Renders the Renderer for all devices in the given order', () => {
    const wrapper = shallow(
      <DevicesPreviewer devices={testDevices} url={testSrc} />
    );
    wrapper.find('Renderer').forEach((renderer, idx) => {
      expect(renderer.prop('device')).to.equal(testDevices[idx]);
    });
  });
});
