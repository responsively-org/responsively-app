import React from 'react';
import {shallow} from 'enzyme';
import {expect} from 'chai';

import Header from '.';

describe('<Header />', () => {
  it('renders a h1 and BrowserZoom components', () => {
    const wrapper = shallow(<Header />);
    expect(wrapper.find('h1')).to.have.lengthOf(1);
    expect(wrapper.find('ZoomInput')).to.have.lengthOf(1);
  });
});
