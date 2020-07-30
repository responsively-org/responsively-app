// @flow
import React from 'react';
import {shallow} from 'enzyme';
import {expect} from 'chai';

import Renderer from '.';

const testSrc = 'https://testUrl.com';
const testDevice1 = {
  name: 'testDevice1',
  width: 100,
  height: 100,
};

describe('<Renderer />', () => {
  it('Renders the header and the iframe', () => {
    const wrapper = shallow(<Renderer src={testSrc} device={testDevice1} />);
    expect(wrapper.find('iframe')).to.have.lengthOf(1);
    expect(wrapper.find('h2')).to.have.lengthOf(1);
  });

  it('Renders the header with the device name', () => {
    const wrapper = shallow(<Renderer src={testSrc} device={testDevice1} />);
    expect(wrapper.find('h2').text()).to.equal(testDevice1.name);
  });

  it('Renders the iframe with the given device dimensions', () => {
    const wrapper = shallow(<Renderer src={testSrc} device={testDevice1} />);
    expect(wrapper.find('iframe').prop('width')).to.equal(testDevice1.width);
    expect(wrapper.find('iframe').prop('height')).to.equal(testDevice1.height);
  });

  it('Renders the iframe with the given url', () => {
    const wrapper = shallow(<Renderer src={testSrc} device={testDevice1} />);
    expect(wrapper.find('iframe').prop('src')).to.equal(testSrc);
  });

  /* it('Calls the callback with a number value', () => {
    const onChange = sinon.spy();
    const wrapper = mount(<BrowserZoom onChange={onChange} />);
    wrapper.find('.MuiSlider-thumb').simulate('mousedown');
    wrapper.find('.MuiSlider-thumb').simulate('mouseup');
    console.log('spy.args', onChange.args);
    assert(onChange.calledWith(100));
  }); */
});
