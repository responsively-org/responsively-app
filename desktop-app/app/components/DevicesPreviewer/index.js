// @flow
import React, {Fragment, useState, useEffect, useRef, createRef} from 'react';
import cx from 'classnames';
import {Tab, Tabs, TabList} from 'react-tabs';
import Renderer from '../Renderer';

import {
  HORIZONTAL_LAYOUT,
  FLEXIGRID_LAYOUT,
  INDIVIDUAL_LAYOUT,
  DEVTOOLS_MODES,
  CSS_EDITOR_MODES,
  isHorizontallyStacked,
} from '../../constants/previewerLayouts';
import {isDeviceEligible} from '../../utils/filterUtils';
import {getDeviceIcon} from '../../utils/iconUtils';
import useStyes from './useStyles';
import LiveCssEditor from '../LiveCssEditor';
import LinkHoverDisplayContainer from '../../containers/LinkHoverDisplayContainer';
import PageNavigatorContainer from '../../containers/PageNavigatorContainer';

export default function DevicesPreviewer(props) {
  const {
    browser: {
      devices,
      devToolsConfig,
      address,
      CSSEditor,
      zoomLevel,
      previewer: {layout},
    },
  } = props;
  const [activeTab, changeTab] = useState(0);
  const classes = useStyes();

  const newActiveTab = activeTab;
  const devicesAfterFiltering = devices
    .map((device, index) => {
      if (isDeviceEligible(device, props.browser.filters)) {
        return device;
      }
    })
    .filter(Boolean);

  let focusedDeviceIndex = 0;
  if (layout === INDIVIDUAL_LAYOUT) {
    if (props.browser.previewer.focusedDeviceId) {
      focusedDeviceIndex = (devicesAfterFiltering || []).findIndex(
        device => device.id === props.browser.previewer.focusedDeviceId
      );
    }
    if (focusedDeviceIndex === -1) {
      focusedDeviceIndex = 0;
    }

    if (focusedDeviceIndex !== activeTab) {
      changeTab(focusedDeviceIndex);
    }
  }

  let focusedDeviceId;
  if (devicesAfterFiltering.length > 0) {
    focusedDeviceId = devicesAfterFiltering[focusedDeviceIndex].id;
  }

  const onTabClick = function onTabClick(newTabIndex) {
    changeTab(newTabIndex);
    props.setFocusedDevice(devicesAfterFiltering[newTabIndex].id);
  };

  const editor = CSSEditor.isOpen && (
    <LiveCssEditor
      boundaryClass={classes.container}
      devToolsConfig={devToolsConfig}
      changeCSSEditorPosition={props.changeCSSEditorPosition}
      onCSSEditorContentChange={props.onCSSEditorContentChange}
      {...CSSEditor}
    />
  );

  return (
    <div
      className={cx(classes.container)}
      style={{
        flexDirection: isHorizontallyStacked(CSSEditor.position)
          ? 'column'
          : null,
      }}
    >
      {(CSSEditor.position === CSS_EDITOR_MODES.LEFT ||
        CSSEditor.position === CSS_EDITOR_MODES.UNDOCKED ||
        CSSEditor.position === CSS_EDITOR_MODES.TOP) &&
        editor}
      <div className={cx(classes.previewer)}>
        {layout === INDIVIDUAL_LAYOUT && (
          <Tabs
            className={cx('react-tabs', classes.reactTabs)}
            onSelect={onTabClick}
            selectedIndex={focusedDeviceIndex}
          >
            <TabList
              className={cx('react-tabs__tab-list', classes.reactTabs__tabList)}
            >
              {devicesAfterFiltering.map(device => (
                <Tab
                  className={cx('react-tabs__tab', classes.reactTabs__tab)}
                  tabId={device.id}
                  key={device.id}
                >
                  {getDeviceIcon(device.type)}
                  {device.name}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        )}
        <div
          className={cx(classes.devicesContainer, {
            [classes.flexigrid]: layout === FLEXIGRID_LAYOUT,
            [classes.horizontal]: layout === HORIZONTAL_LAYOUT,
          })}
        >
          {devices.map((device, index) => (
            <div
              key={device.id}
              className={cx({
                [classes.tab]: layout === INDIVIDUAL_LAYOUT,
                [classes.activeTab]:
                  layout === INDIVIDUAL_LAYOUT && focusedDeviceId === device.id,
              })}
            >
              <Renderer
                hidden={!isDeviceEligible(device, props.browser.filters)}
                device={device}
                src={address}
                zoomLevel={zoomLevel}
                transmitNavigatorStatus={index === 0}
                onDeviceMutedChange={props.onDeviceMutedChange}
              />
            </div>
          ))}
        </div>
      </div>
      {(CSSEditor.position === CSS_EDITOR_MODES.RIGHT ||
        CSSEditor.position === CSS_EDITOR_MODES.BOTTOM) &&
        editor}
      <LinkHoverDisplayContainer />
      <PageNavigatorContainer />
    </div>
  );
}
