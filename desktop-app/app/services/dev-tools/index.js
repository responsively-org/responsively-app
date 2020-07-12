import CDP from 'chrome-remote-interface';
import Promise from 'bluebird';
import console from 'console';
import {remote, ipcRenderer} from 'electron';
// import console from 'electron-timber';

export const PORT = 31313;

const inspectCode = backendNodeId => `(async () => {
  InspectorFrontendAPI.showPanel('elements');
  setTimeout(async () => {
    const mainTarget = SDK.targetManager.mainTarget();
    const domModel = mainTarget.model(SDK.DOMModel);
    const res = await domModel.pushNodesByBackendIdsToFrontend(
      new Set().add(${backendNodeId})
    );
    if (res) {
      const nodeId = res.values().next().value.id;
      await Main.sendOverProtocol('DOM.setInspectedNode', {nodeId});
      const nodeForSelection = domModel.nodeForId(${nodeId});
      UI.panels.elements.selectDOMNode(nodeForSelection, true);
    }
  }, 300);
})()`;

class DevTools {
  constructor() {
    this.targets = [];
    this.refreshTargets();
    /* console.log(
      'Network off',
      await client.Network.emulateNetworkConditions({
        offline: true,
        latency: 1,
        downloadThroughput: -1,
        uploadThroughput: -1,
      })
    ); */
    /* console.log(
      'Inspector enable',
      await client.Emulation.setEmitTouchEventsForMouse({enabled: true})
    ); */
    /* console.log(
      'Inspector enable',
      await client.Overlay.setInspectMode({
        mode: 'searchForNode',
        highlightConfig: {
          showInfo: true,
          showStyles: true,
          contentColor: {r: 111, g: 168, b: 220, a: 0.66},
          paddingColor: {r: 147, g: 196, b: 125, a: 0.66},
          borderColor: {r: 255, g: 229, b: 153, a: 0.66},
          marginColor: {r: 246, g: 178, b: 107, a: 0.66},
        },
      })
    ); */
  }

  refreshTargets = async () => {
    this.targets = (
      await CDP.List({
        host: '127.0.0.1',
        port: PORT,
      })
    ).filter(target => target.type === 'webview');
    console.log('this.targets', this.targets);
    this.clients = await Promise.map(this.targets, target =>
      CDP({target: target.id, port: 31313})
    );
  };

  _enableInspectorForClient = async client => {
    const {Overlay, DOM} = client;
    const count = 0;
    Overlay.inspectNodeRequested(async requestedNode => {
      try {
        await Overlay.setInspectMode({
          mode: 'none',
          highlightConfig: {},
        });
        const resolvedNode = await DOM.resolveNode(requestedNode);
        const requestedNodeNew = await DOM.requestNode({
          objectId: resolvedNode.object.objectId,
        });
        const doc = await DOM.getDocument();
        const {
          nodeIds: [requiredNodeId],
        } = await DOM.pushNodesByBackendIdsToFrontend({
          backendNodeIds: [requestedNode.backendNodeId],
        });
        ipcRenderer.send('open-devtools-new', {
          webViewId: document
            .getElementsByTagName('webview')[0]
            .getWebContentsId(),
          backendNodeId: requestedNode.backendNodeId,
        });
        return;
        DOM.setInspectedNode({nodeId: requiredNodeId});
        console.log('requiredNodeId', requiredNodeId);
        const browserView = remote.webContents.fromId(
          document.getElementsByTagName('webview')[0].getWebContentsId()
        );
        const devToolsView = remote.webContents.fromId(
          document.getElementById('dev-tools-1').getWebContentsId()
        );
        browserView.setDevToolsWebContents(devToolsView);
        browserView.openDevTools();
        devToolsView.openDevTools();
        devToolsView.executeJavaScript(
          inspectCode(requestedNode.backendNodeId)
        );
        console.log('Done inspecting');
        // return;
      } catch (err) {
        console.log('err', err);
      }
    });
    DOM.enable();
    Overlay.enable();
    Overlay.setInspectMode({
      mode: 'searchForNode',
      highlightConfig: {
        showInfo: true,
        showStyles: true,
        contentColor: {r: 111, g: 168, b: 220, a: 0.66},
        paddingColor: {r: 147, g: 196, b: 125, a: 0.66},
        borderColor: {r: 255, g: 229, b: 153, a: 0.66},
        marginColor: {r: 246, g: 178, b: 107, a: 0.66},
      },
    });
  };

  enableUniversalInspector = async () => {
    await Promise.map(this.clients, this._enableInspectorForClient);
  };
}

export default new DevTools();
