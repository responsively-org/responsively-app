// @flow
import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from 'chai';
import sinon from 'sinon';

import AddressInput from './AddressInput';

// Mock the Material-UI components
jest.mock('@material-ui/core/styles', () => ({
  withTheme: Component => Component,
  withStyles: () => Component => Component,
}));

jest.mock('../services/searchUrlSuggestions', () => ({
  getExistingSearchResults: jest.fn(),
  updateExistingUrl: jest.fn(),
  searchUrlUtils: jest.fn(() => []),
}));

jest.mock('../utils/permissionUtils', () => ({
  notifyPermissionToHandleReloadOrNewAddress: jest.fn(),
}));

jest.mock('../utils/urlUtils', () => ({
  normalize: url => url,
}));

describe('<AddressInput />', () => {
  const defaultProps = {
    address: 'https://example.com',
    homepage: 'https://example.com',
    isBookmarked: false,
    onChange: sinon.spy(),
    setHomepage: sinon.spy(),
    toggleBookmark: sinon.spy(),
    deleteCookies: sinon.spy(),
    deleteStorage: sinon.spy(),
    theme: {palette: {text: {primary: '#000'}}},
    classes: {
      addressBarContainer: '',
      showSuggestions: '',
      addressInput: '',
      optionsContainer: '',
      icon: '',
      iconRound: '',
      iconHoverDisabled: '',
      iconDisabled: '',
      flexAlignVerticalMiddle: '',
    },
  };

  it('renders input field with the provided address', () => {
    const wrapper = shallow(<AddressInput {...defaultProps} />);
    expect(wrapper.find('input')).to.have.lengthOf(1);
    expect(wrapper.find('input').prop('value')).to.equal('https://example.com');
  });

  it('sets isNavigating flag when onChange is triggered', done => {
    const onChange = sinon.spy();
    const props = {...defaultProps, onChange};
    const wrapper = mount(<AddressInput {...props} />);
    const instance = wrapper.instance();

    // Initial state should have isNavigating as false
    expect(instance.state.isNavigating).to.equal(false);

    // Trigger onChange
    instance._onChange();

    // isNavigating should be set to true immediately
    expect(instance.state.isNavigating).to.equal(true);

    // After timeout, isNavigating should be set back to false
    setTimeout(() => {
      expect(instance.state.isNavigating).to.equal(false);
      done();
    }, 150);
  });

  it('does not update address from props when isNavigating is true', () => {
    const wrapper = mount(<AddressInput {...defaultProps} />);
    const instance = wrapper.instance();

    // Set isNavigating to true
    instance.setState({isNavigating: true});

    // Try to update props with a new address
    wrapper.setProps({address: 'https://newaddress.com'});

    // userTypedAddress should not have changed
    expect(instance.state.userTypedAddress).to.equal('https://example.com');
  });

  it('updates address from props when isNavigating is false', () => {
    const wrapper = mount(<AddressInput {...defaultProps} />);
    const instance = wrapper.instance();

    // Ensure isNavigating is false
    expect(instance.state.isNavigating).to.equal(false);

    // Update props with a new address
    wrapper.setProps({address: 'https://newaddress.com'});

    // userTypedAddress should have changed
    expect(instance.state.userTypedAddress).to.equal('https://newaddress.com');
  });

  it('cleans up debounced functions on unmount', () => {
    const wrapper = mount(<AddressInput {...defaultProps} />);
    const instance = wrapper.instance();

    // Mock the cancel functions
    const debouncedOnChangeCancel = sinon.spy();
    const filterExistingUrlCancel = sinon.spy();

    instance._debouncedOnChange = {cancel: debouncedOnChangeCancel};
    instance._filterExistingUrl = {cancel: filterExistingUrlCancel};

    // Unmount the component
    wrapper.unmount();

    // Verify cancel was called
    expect(debouncedOnChangeCancel.calledOnce).to.equal(true);
    expect(filterExistingUrlCancel.calledOnce).to.equal(true);
  });

  it('sets isNavigating flag when suggestion is clicked', done => {
    const onChange = sinon.spy();
    const props = {...defaultProps, onChange};
    const wrapper = mount(<AddressInput {...props} />);
    const instance = wrapper.instance();

    // Initial state should have isNavigating as false
    expect(instance.state.isNavigating).to.equal(false);

    // Trigger onSearchedUrlClick with a different URL
    instance._onSearchedUrlClick('https://different.com', 0);

    // isNavigating should be set to true immediately
    expect(instance.state.isNavigating).to.equal(true);

    // After timeout, isNavigating should be set back to false
    setTimeout(() => {
      expect(instance.state.isNavigating).to.equal(false);
      done();
    }, 150);
  });
});
