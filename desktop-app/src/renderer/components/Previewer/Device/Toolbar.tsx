import { Icon } from '@iconify/react';
import { useState } from 'react';
import Button from 'renderer/components/Button';
import useSound from 'use-sound';
import { ScreenshotArgs, ScreenshotResult } from 'main/screenshot';
import { Device } from 'common/deviceList';
import WebPage from 'main/screenshot/webpage';

import screenshotSfx from 'renderer/assets/sfx/screenshot.mp3';
import { updateWebViewHeightAndScale } from 'common/webViewUtils';
import { useDispatch, useSelector } from 'react-redux';
import { DropDown } from '../../DropDown';
import {
  InjectedCss,
  selectCss,
  setCss,
} from '../../../store/features/renderer';

interface Props {
  webview: Electron.WebviewTag | null;
  device: Device;
  setScreenshotInProgress: (value: boolean) => void;
  openDevTools: () => void;
  onRotate: (state: boolean) => void;
  onIndividualLayoutHandler: (device: Device) => void;
  isIndividualLayout: boolean;
}

const Toolbar = ({
  webview,
  device,
  setScreenshotInProgress,
  openDevTools,
  onRotate,
  onIndividualLayoutHandler,
  isIndividualLayout,
}: Props) => {
  const dispatch = useDispatch();
  const cssSelector: InjectedCss | undefined = useSelector(selectCss);

  const [eventMirroringOff, setEventMirroringOff] = useState<boolean>(false);
  const [playScreenshotDone] = useSound(screenshotSfx, { volume: 0.5 });
  const [screenshotLoading, setScreenshotLoading] = useState<boolean>(false);
  const [fullScreenshotLoading, setFullScreenshotLoading] =
    useState<boolean>(false);
  const [rotated, setRotated] = useState<boolean>(false);

  const redgreen = [
    'Deuteranopia',
    'Deuteranomaly',
    'Protanopia',
    'Protanomaly',
  ];
  const blueyellow = ['Tritanopia', 'Tritanomaly'];
  const full = ['Achromatomaly', 'Achromatopsia'];
  const visualimpairments = ['Cataract', 'Farsightedness', 'Glaucome'];
  const sunlight = ['Solarize'];

  const refreshView = () => {
    if (webview) {
      webview.reload();
    }
  };

  const toggleEventMirroring = async () => {
    if (webview === null) {
      return;
    }
    try {
      await webview.executeJavaScript(
        `
        if(window.___browserSync___){
          window.___browserSync___.socket.${
            eventMirroringOff ? 'open' : 'close'
          }()
        }
        true
      `
      );
      setEventMirroringOff(!eventMirroringOff);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error while toggleing event mirroring', error);
    }
  };

  const quickScreenshot = async () => {
    if (webview === null) {
      return;
    }
    setScreenshotLoading(true);
    try {
      await window.electron.ipcRenderer.invoke<
        ScreenshotArgs,
        ScreenshotResult
      >('screenshot', {
        webContentsId: webview.getWebContentsId(),
        device,
      });
      playScreenshotDone();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error while taking quick screenshot', error);
    }
    setScreenshotLoading(false);
  };

  const applyColorDeficiency = async (colorDeficiency: string | undefined) => {
    if (webview === null) {
      return;
    }
    if (colorDeficiency === undefined) {
      return;
    }

    const xsltPath =
      'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgdmVyc2lvbj0iMS4xIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9InByb3Rhbm9waWEiPgogICAgICA8ZmVDb2xvck1hdHJpeAogICAgICAgIGluPSJTb3VyY2VHcmFwaGljIgogICAgICAgIHR5cGU9Im1hdHJpeCIKICAgICAgICB2YWx1ZXM9IjAuNTY3LCAwLjQzMywgMCwgICAgIDAsIDAKICAgICAgICAgICAgICAgIDAuNTU4LCAwLjQ0MiwgMCwgICAgIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLjI0MiwgMC43NTgsIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLCAgICAgMCwgICAgIDEsIDAiLz4KICAgIDwvZmlsdGVyPgogICAgPGZpbHRlciBpZD0icHJvdGFub21hbHkiPgogICAgICA8ZmVDb2xvck1hdHJpeAogICAgICAgIGluPSJTb3VyY2VHcmFwaGljIgogICAgICAgIHR5cGU9Im1hdHJpeCIKICAgICAgICB2YWx1ZXM9IjAuODE3LCAwLjE4MywgMCwgICAgIDAsIDAKICAgICAgICAgICAgICAgIDAuMzMzLCAwLjY2NywgMCwgICAgIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLjEyNSwgMC44NzUsIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLCAgICAgMCwgICAgIDEsIDAiLz4KICAgIDwvZmlsdGVyPgogICAgPGZpbHRlciBpZD0iZGV1dGVyYW5vcGlhIj4KICAgICAgPGZlQ29sb3JNYXRyaXgKICAgICAgICBpbj0iU291cmNlR3JhcGhpYyIKICAgICAgICB0eXBlPSJtYXRyaXgiCiAgICAgICAgdmFsdWVzPSIwLjYyNSwgMC4zNzUsIDAsICAgMCwgMAogICAgICAgICAgICAgICAgMC43LCAgIDAuMywgICAwLCAgIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLjMsICAgMC43LCAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAgMCwgICAgIDAsICAgMSwgMCIvPgogICAgPC9maWx0ZXI+CiAgICA8ZmlsdGVyIGlkPSJkZXV0ZXJhbm9tYWx5Ij4KICAgICAgPGZlQ29sb3JNYXRyaXgKICAgICAgICBpbj0iU291cmNlR3JhcGhpYyIKICAgICAgICB0eXBlPSJtYXRyaXgiCiAgICAgICAgdmFsdWVzPSIwLjgsICAgMC4yLCAgIDAsICAgICAwLCAwCiAgICAgICAgICAgICAgICAwLjI1OCwgMC43NDIsIDAsICAgICAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAgMC4xNDIsIDAuODU4LCAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAgMCwgICAgIDAsICAgICAxLCAwIi8+CiAgICA8L2ZpbHRlcj4KICAgIDxmaWx0ZXIgaWQ9InRyaXRhbm9waWEiPgogICAgICA8ZmVDb2xvck1hdHJpeAogICAgICAgIGluPSJTb3VyY2VHcmFwaGljIgogICAgICAgIHR5cGU9Im1hdHJpeCIKICAgICAgICB2YWx1ZXM9IjAuOTUsIDAuMDUsICAwLCAgICAgMCwgMAogICAgICAgICAgICAgICAgMCwgICAgMC40MzMsIDAuNTY3LCAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAwLjQ3NSwgMC41MjUsIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgIDAsICAgICAwLCAgICAgMSwgMCIvPgogICAgPC9maWx0ZXI+CiAgICA8ZmlsdGVyIGlkPSJ0cml0YW5vbWFseSI+CiAgICAgIDxmZUNvbG9yTWF0cml4CiAgICAgICAgaW49IlNvdXJjZUdyYXBoaWMiCiAgICAgICAgdHlwZT0ibWF0cml4IgogICAgICAgIHZhbHVlcz0iMC45NjcsIDAuMDMzLCAwLCAgICAgMCwgMAogICAgICAgICAgICAgICAgMCwgICAgIDAuNzMzLCAwLjI2NywgMCwgMAogICAgICAgICAgICAgICAgMCwgICAgIDAuMTgzLCAwLjgxNywgMCwgMAogICAgICAgICAgICAgICAgMCwgICAgIDAsICAgICAwLCAgICAgMSwgMCIvPgogICAgPC9maWx0ZXI+CiAgICA8ZmlsdGVyIGlkPSJhY2hyb21hdG9wc2lhIj4KICAgICAgPGZlQ29sb3JNYXRyaXgKICAgICAgICBpbj0iU291cmNlR3JhcGhpYyIKICAgICAgICB0eXBlPSJtYXRyaXgiCiAgICAgICAgdmFsdWVzPSIwLjI5OSwgMC41ODcsIDAuMTE0LCAwLCAwCiAgICAgICAgICAgICAgICAwLjI5OSwgMC41ODcsIDAuMTE0LCAwLCAwCiAgICAgICAgICAgICAgICAwLjI5OSwgMC41ODcsIDAuMTE0LCAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAgMCwgICAgIDAsICAgICAxLCAwIi8+CiAgICA8L2ZpbHRlcj4KICAgIDxmaWx0ZXIgaWQ9ImFjaHJvbWF0b21hbHkiPgogICAgICA8ZmVDb2xvck1hdHJpeAogICAgICAgIGluPSJTb3VyY2VHcmFwaGljIgogICAgICAgIHR5cGU9Im1hdHJpeCIKICAgICAgICB2YWx1ZXM9IjAuNjE4LCAwLjMyMCwgMC4wNjIsIDAsIDAKICAgICAgICAgICAgICAgIDAuMTYzLCAwLjc3NSwgMC4wNjIsIDAsIDAKICAgICAgICAgICAgICAgIDAuMTYzLCAwLjMyMCwgMC41MTYsIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLCAgICAgMCwgICAgIDEsIDAiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KPC9zdmc+Cg==';
    const css = `
      body {
       -webkit-filter: url('${xsltPath}#${colorDeficiency}');
        filter: url('${xsltPath}#${colorDeficiency}');
      }
      `;
    if (cssSelector !== undefined) {
      if (cssSelector.css === css) {
        await webview.removeInsertedCSS(cssSelector.key);
        dispatch(setCss(undefined));
        return;
      }
      await webview.removeInsertedCSS(cssSelector.key);
      dispatch(setCss(undefined));
    }

    try {
      const key = await webview.insertCSS(css);
      dispatch(setCss({ key, css, name: colorDeficiency }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error inserting css', error);
      dispatch(setCss(undefined));
    }
  };

  const applySunlight = async (condition: string | undefined) => {
    if (webview === null) {
      return;
    }
    if (condition === undefined) {
      return;
    }

    const css = 'body {backdrop-filter: brightness(0.5) !important;}';

    if (cssSelector !== undefined) {
      if (cssSelector.css === css) {
        await webview.removeInsertedCSS(cssSelector.key);
        dispatch(setCss(undefined));
        return;
      }
      await webview.removeInsertedCSS(cssSelector.key);
      dispatch(setCss(undefined));
    }

    try {
      const key = await webview.insertCSS(css);
      dispatch(setCss({ key, css, name: condition }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error inserting css', error);
      dispatch(setCss(undefined));
    }
  };

  const applyVisualImpairment = async (
    visualImpairment: string | undefined
  ) => {
    if (webview === null) {
      return;
    }
    if (visualImpairment === undefined) {
      return;
    }
    const blur =
      'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8ZGVmcz4KICAgICAgICA8ZmlsdGVyIGlkPSJnYXVzc2lhbl9ibHVyIj4KICAgICAgICAgICAgPGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjEwIiAvPgogICAgICAgIDwvZmlsdGVyPgogICAgPC9kZWZzPgo8L3N2Zz4=';

    const impairments: { [key: string]: string } = {
      cataract: `body {
       -webkit-filter: url('${blur}#gaussian_blur');
        filter: url('${blur}#gaussian_blur');
      }`,
      glaucome: `#bigoverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

#spotlight {
  border-radius: 50%;
  width: 300vmax;
  height: 300vmax;
  box-shadow: 0 0 5vmax 110vmax inset black;
  position: absolute;
  z-index: -1;
  left: -75vmax;
  top: -75vmax;
}`,
      farsightedness: `body { filter: blur(2px); }`,
    };
    const css = impairments[visualImpairment.toLowerCase()];
    if (cssSelector !== undefined) {
      if (cssSelector.css === css) {
        await webview.removeInsertedCSS(cssSelector.key);
        dispatch(setCss(undefined));
        return;
      }
      await webview.removeInsertedCSS(cssSelector.key);
      dispatch(setCss(undefined));
    }
    try {
      const key = await webview.insertCSS(css);
      console.log({ visualImpairment });
      if (visualImpairment.toLowerCase() === 'glaucome') {
        try {
          await webview.executeJavaScript(
            String(`var div = document.createElement('div');
div.innerHTML ='<div class="bigoverlay" id="bigoverlay"><div class="spotlight" id="spotlight"></div></div>';
var body = document.body;
body.appendChild(div);
function handleMouseMove(){
    var eventDoc, doc, body;
    eventDoc = (event.target && event.target.ownerDocument) || document;
    doc = eventDoc.documentElement;
    body = eventDoc.body;
  event.pageX = event.clientX +
    (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
    (doc && doc.clientLeft || body && body.clientLeft || 0);
  event.pageY = event.clientY +
    (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
    (doc && doc.clientTop  || body && body.clientTop  || 0 );
  const spotlight = document.getElementById("spotlight");
  const boundingRect = spotlight.getBoundingClientRect();
  spotlight.style.left = (event.pageX - boundingRect.width / 2) + "px"
  spotlight.style.top = (event.pageY - boundingRect.height / 2) + "px"
};document.onmousemove = handleMouseMove;0`)
          );
          // const listener = await webview.executeJavaScript()
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error({ e });
        }
      }

      dispatch(setCss({ key, css, name: visualImpairment }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error inserting css', error);
      dispatch(setCss(undefined));
    }
  };

  const fullScreenshot = async () => {
    if (webview === null) {
      return;
    }
    setFullScreenshotLoading(true);
    try {
      const webviewTag = window.document.getElementById(device.name);
      if (webviewTag === null) {
        return;
      }
      setScreenshotInProgress(true);
      const webPage = new WebPage(webview as unknown as Electron.WebContents);
      const pageHeight = await webPage.getPageHeight();

      const previousHeight = webviewTag.style.height;
      const previousTransform = webviewTag.style.transform;
      updateWebViewHeightAndScale(webviewTag, pageHeight);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await window.electron.ipcRenderer.invoke<
        ScreenshotArgs,
        ScreenshotResult
      >('screenshot', {
        webContentsId: webview.getWebContentsId(),
        device,
      });

      webviewTag.style.height = previousHeight;
      webviewTag.style.transform = previousTransform;
      setScreenshotInProgress(false);
      playScreenshotDone();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error while taking full screenshot', error);
    }
    setFullScreenshotLoading(false);
  };

  const rotate = async () => {
    setRotated(!rotated);
    onRotate(!rotated);
  };

  return (
    <div className="flex items-center justify-between gap-1">
      <div className="my-1 flex items-center gap-1">
        <Button onClick={refreshView} title="Refresh This View">
          <Icon icon="ic:round-refresh" />
        </Button>
        <Button
          onClick={quickScreenshot}
          isLoading={screenshotLoading}
          title="Quick Screenshot"
        >
          <div className="relative h-4 w-4">
            <Icon
              icon="ic:outline-photo-camera"
              className="absolute top-0 left-0"
            />
            <Icon
              icon="clarity:lightning-solid"
              className="absolute top-[-1px] right-[-2px]"
              height={8}
            />
          </div>
        </Button>
        <Button
          onClick={fullScreenshot}
          isLoading={fullScreenshotLoading}
          title="Full Page Screenshot"
        >
          <Icon icon="ic:outline-photo-camera" />
        </Button>
        <Button
          onClick={toggleEventMirroring}
          isActive={eventMirroringOff}
          title="Disable Event Mirroring"
        >
          <Icon icon="fluent:plug-disconnected-24-regular" />
        </Button>
        <Button onClick={openDevTools} title="Open Devtools">
          <Icon icon="ic:round-code" />
        </Button>
        <Button onClick={rotate} title="Rotate This Device">
          <Icon
            icon={
              rotated
                ? 'mdi:phone-rotate-portrait'
                : 'mdi:phone-rotate-landscape'
            }
          />
        </Button>

        <DropDown
          className="text-xs"
          label={<Icon icon="codicon:debug-line-by-line" fontSize={18} />}
          options={[
            {
              label: (
                <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                  <span className="font-bold">A11y Tools</span>
                </div>
              ),
              onClick: null,
            },
            {
              label: (
                <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                  <span>Visual deficiency</span>
                </div>
              ),
              onClick: null,
            },
            {
              label: (
                <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                  <span className="ml-1 font-semibold">
                    Red-green deficiency
                  </span>
                </div>
              ),
              onClick: null,
            },
            ...redgreen.map((x: string) => {
              return {
                label: (
                  <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                    <span
                      className={`ml-2 ${
                        cssSelector?.name === x.toLowerCase()
                          ? 'font-semibold text-black'
                          : ''
                      }`}
                    >
                      {x}
                    </span>
                  </div>
                ),
                onClick: () => {
                  applyColorDeficiency(x.toLowerCase());
                },
              };
            }),
            {
              label: (
                <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                  <span className="ml-1 font-semibold">
                    Blue-yellow deficiency
                  </span>
                </div>
              ),
              onClick: null,
            },
            ...blueyellow.map((x: string) => {
              return {
                label: (
                  <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                    <span
                      className={`${
                        cssSelector?.name === x.toLowerCase()
                          ? 'ml-2 font-semibold text-black'
                          : 'ml-2'
                      }`}
                    >
                      {cssSelector?.name === x.toLowerCase() ? (
                        <Icon icon="codicon:chevron-right" fontSize={14} />
                      ) : (
                        <></>
                      )}{' '}
                      {x}
                    </span>
                  </div>
                ),
                onClick: () => {
                  applyColorDeficiency(x.toLowerCase());
                },
              };
            }),
            {
              label: (
                <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                  <span className="ml-1 font-semibold">
                    Full color deficiency
                  </span>
                </div>
              ),
              onClick: null,
            },
            ...full.map((x: string) => {
              return {
                label: (
                  <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                    <span
                      className={`ml-2 ${
                        cssSelector?.name === x.toLowerCase()
                          ? 'font-semibold text-black'
                          : ''
                      }`}
                    >
                      {x}
                    </span>
                  </div>
                ),
                onClick: () => {
                  applyColorDeficiency(x.toLowerCase());
                },
              };
            }),
            {
              label: (
                <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                  <span className="ml-1 font-semibold">Visual impairment</span>
                </div>
              ),
              onClick: null,
            },
            ...visualimpairments.map((x: string) => {
              return {
                label: (
                  <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                    <span
                      className={`ml-2 ${
                        cssSelector?.name === x.toLowerCase()
                          ? 'font-semibold text-black'
                          : ''
                      }`}
                    >
                      {x}
                    </span>
                  </div>
                ),
                onClick: () => {
                  applyVisualImpairment(x.toLowerCase());
                },
              };
            }),
            {
              label: (
                <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                  <span className="ml-1 font-semibold">Visual impairment</span>
                </div>
              ),
              onClick: null,
            },
            ...sunlight.map((x: string) => {
              return {
                label: (
                  <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                    <span
                      className={`ml-2 ${
                        cssSelector?.name === x.toLowerCase()
                          ? 'font-semibold text-black'
                          : ''
                      }`}
                    >
                      {x}
                    </span>
                  </div>
                ),
                onClick: () => {
                  applySunlight(x.toLowerCase());
                },
              };
            }),
          ]}
        />
      </div>
      <Button
        onClick={() => onIndividualLayoutHandler(device)}
        title={`${isIndividualLayout ? 'Disable' : 'Enable'} Individual Layout`}
      >
        <Icon
          icon={
            isIndividualLayout
              ? 'ic:twotone-zoom-in-map'
              : 'ic:twotone-zoom-out-map'
          }
        />
      </Button>
    </div>
  );
};

export default Toolbar;
