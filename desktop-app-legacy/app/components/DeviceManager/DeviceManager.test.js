import React from 'react';
import { shallow } from 'enzyme';
import DeviceManager from './index';

const mockProps = {
  devices: [],
  addDevice: jest.fn(),
  editDevice: jest.fn(),
  deleteDevice: jest.fn(),
};

describe('DeviceManager', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<DeviceManager {...mockProps} />);
  });

  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a table with the devices', () => {
    mockProps.devices = [
      { id: '1', name: 'iPhone X', width: 375, height: 812 },
      { id: '2', name: 'iPad Pro', width: 1024, height: 1366 },
    ];

    wrapper.setProps(mockProps);

    const table = wrapper.find('table');

    expect(table.exists()).toBe(true);
    expect(table.find('tr')).toHaveLength(2);
  });

  it('should render a button to add a new device', () => {
    const button = wrapper.find('button');

    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('Add Device');
  });

  it('should call the addDevice prop when the button is clicked', () => {
    const button = wrapper.find('button');

    button.simulate('click');

    expect(mockProps.addDevice).toHaveBeenCalledTimes(1);
  });

  it('should render an edit icon for each device', () => {
    mockProps.devices = [
      { id: '1', name: 'iPhone X', width: 375, height: 812 },
      { id: '2', name: 'iPad Pro', width: 1024, height: 1366 },
    ];

    wrapper.setProps(mockProps);

    const icons = wrapper.find('.edit-icon');

    expect(icons).toHaveLength(2);
  });

  it('should call the editDevice prop when an edit icon is clicked', () => {
    mockProps.devices = [
      { id: '1', name: 'iPhone X', width: 375, height: 812 },
      { id: '2', name: 'iPad Pro', width: 1024, height: 1366 },
    ];

    wrapper.setProps(mockProps);

    const icons = wrapper.find('.edit-icon');

    icons.at(0).simulate('click');

    expect(mockProps.editDevice).toHaveBeenCalledTimes(1);
    expect(mockProps.editDevice).toHaveBeenCalledWith(mockProps.devices[0]);
  });

  it('should render a delete icon for each device', () => {
    mockProps.devices = [
      { id: '1', name: 'iPhone X', width: 375, height: 812 },
      { id: '2', name: 'iPad Pro', width: 1024, height: 1366 },
    ];

    wrapper.setProps(mockProps);

    const icons = wrapper.find('.delete-icon');

    expect(icons).toHaveLength(2);
  });

  it('should call the deleteDevice prop when a delete icon is clicked', () => {
    mockProps.devices = [
      { id: '1', name: 'iPhone X', width: 375, height: 812 },
      { id: '2', name: 'iPad Pro', width: 1024, height: 1366 },
    ];

    wrapper.setProps(mockProps);

    const icons = wrapper.find('.delete-icon');

    icons.at(0).simulate('click');

    expect(mockProps.deleteDevice).toHaveBeenCalledTimes(1);
    expect(mockProps.deleteDevice).toHaveBeenCalledWith(mockProps.devices[0]);
  });
});
