import React from 'react';
import cx from 'classnames';
import ClearNetworkCache from '../ClearNetworkCache';
import NetworkThrottling from '../NetworkThrottling';
import NetworkProxy from '../NetworkProxy';

import styles from './styles.css';

export default function NetworkConfiguration({
  throttling,
  proxy,
  onActiveThrottlingProfileChanged,
  onThrottlingProfilesListChanged,
  onClearNetworkCache,
  onToggleUseProxy,
  onProxyProfileChanged,
}) {
  return (
    <div>
      <ClearNetworkCache onClearNetworkCache={onClearNetworkCache} />
      <NetworkThrottling
        throttling={throttling}
        onActiveThrottlingProfileChanged={onActiveThrottlingProfileChanged}
        onThrottlingProfilesListChanged={onThrottlingProfilesListChanged}
      />
      <NetworkProxy
        proxy={proxy}
        onToggleUseProxy={onToggleUseProxy}
        onProxyProfileChanged={onProxyProfileChanged}
      />
    </div>
  );
}
