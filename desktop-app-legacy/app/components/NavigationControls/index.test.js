// @flow
import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect, assert} from 'chai';
import sinon from 'sinon';

import Slider from '@material-ui/core/Slider';
import BrowserZoom from '.';

describe('<BrowserZoom />', () => {
  it('Renders label and the slider component ', () => {
    const wrapper = shallow(<BrowserZoom />);
    expect(wrapper.find(Slider)).to.have.lengthOf(1);
  });

  it('Calls the callback on slider change', () => {
    const onChange = sinon.spy();
    const wrapper = mount(<BrowserZoom onChange={onChange} />);
    wrapper.find('.MuiSlider-thumb').simulate('mousedown');
    wrapper.find('.MuiSlider-thumb').simulate('mouseup');
    expect(onChange).to.have.property('callCount', 1);
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
