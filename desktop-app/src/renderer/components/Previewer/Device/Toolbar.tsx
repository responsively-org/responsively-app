import { Icon } from '@iconify/react';
import { useState } from 'react';
import Button from 'renderer/components/Button';
import useSound from 'use-sound';
import { ScreenshotArgs, ScreenshotResult } from 'main/screenshot';
import { Device } from 'common/deviceList';
import WebPage from 'main/screenshot/webpage';

import screenshotSfx from 'renderer/assets/sfx/screenshot.mp3';
import { updateWebViewHeightAndScale } from 'common/webViewUtils';
import { useDispatch } from 'react-redux';
import { DropDown } from '../../DropDown';
import { a11ycss, grid as _grid, layout } from './assets';

export interface InjectedCss {
  key: string;
  css: string;
  name: string;
}

interface Props {
  webview: Electron.WebviewTag | null;
  device: Device;
  setScreenshotInProgress: (value: boolean) => void;
  openDevTools: () => void;
  toggleRuler: () => void;
  onRotate: (state: boolean) => void;
  onIndividualLayoutHandler: (device: Device) => void;
  isIndividualLayout: boolean;
}

const Toolbar = ({
  webview,
  device,
  setScreenshotInProgress,
  openDevTools,
  toggleRuler,
  onRotate,
  onIndividualLayoutHandler,
  isIndividualLayout,
}: Props) => {
  const [injectCss, setInjectCss] = useState<InjectedCss>();
  const [eventMirroringOff, setEventMirroringOff] = useState<boolean>(false);
  const [playScreenshotDone] = useSound(screenshotSfx, { volume: 0.5 });
  const [screenshotLoading, setScreenshotLoading] = useState<boolean>(false);
  const [fullScreenshotLoading, setFullScreenshotLoading] =
    useState<boolean>(false);
  const [rotated, setRotated] = useState<boolean>(false);

  const debuggers = ['Layout', 'A11yCss', 'Grid'];

  const grid: string = _grid(0.5);
  const debugStylesheet: { [key: string]: string } = {
    layout,
    a11ycss,
    grid,
  };
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

  const refreshView = async () => {
    if (webview) {
      if (injectCss) {
        await webview.removeInsertedCSS(injectCss.key);
      }
      setInjectCss(undefined);

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

  const applyCss = async (
    debugType: string,
    css: string,
    js: string | null = null
  ) => {
    if (webview === null) {
      return;
    }
    if (css === undefined) {
      return;
    }

    if (injectCss !== undefined) {
      if (js !== null) {
        webview.reload();
      }
      if (injectCss.css === css) {
        await webview.removeInsertedCSS(injectCss.key);
        setInjectCss(undefined);
        return;
      }
      await webview.removeInsertedCSS(injectCss.key);
      setInjectCss(undefined);
    }

    try {
      const key = await webview.insertCSS(css);
      setInjectCss({ key, css, name: debugType });
      if (js !== null) {
        await webview.executeJavaScript(js);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error inserting css', error);
      // dispatch(setCss(undefined));
      setInjectCss(undefined);
    }
  };

  const applyColorDeficiency = async (colorDeficiency: string) => {
    const xsltPath =
      'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgdmVyc2lvbj0iMS4xIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9InByb3Rhbm9waWEiPgogICAgICA8ZmVDb2xvck1hdHJpeAogICAgICAgIGluPSJTb3VyY2VHcmFwaGljIgogICAgICAgIHR5cGU9Im1hdHJpeCIKICAgICAgICB2YWx1ZXM9IjAuNTY3LCAwLjQzMywgMCwgICAgIDAsIDAKICAgICAgICAgICAgICAgIDAuNTU4LCAwLjQ0MiwgMCwgICAgIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLjI0MiwgMC43NTgsIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLCAgICAgMCwgICAgIDEsIDAiLz4KICAgIDwvZmlsdGVyPgogICAgPGZpbHRlciBpZD0icHJvdGFub21hbHkiPgogICAgICA8ZmVDb2xvck1hdHJpeAogICAgICAgIGluPSJTb3VyY2VHcmFwaGljIgogICAgICAgIHR5cGU9Im1hdHJpeCIKICAgICAgICB2YWx1ZXM9IjAuODE3LCAwLjE4MywgMCwgICAgIDAsIDAKICAgICAgICAgICAgICAgIDAuMzMzLCAwLjY2NywgMCwgICAgIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLjEyNSwgMC44NzUsIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLCAgICAgMCwgICAgIDEsIDAiLz4KICAgIDwvZmlsdGVyPgogICAgPGZpbHRlciBpZD0iZGV1dGVyYW5vcGlhIj4KICAgICAgPGZlQ29sb3JNYXRyaXgKICAgICAgICBpbj0iU291cmNlR3JhcGhpYyIKICAgICAgICB0eXBlPSJtYXRyaXgiCiAgICAgICAgdmFsdWVzPSIwLjYyNSwgMC4zNzUsIDAsICAgMCwgMAogICAgICAgICAgICAgICAgMC43LCAgIDAuMywgICAwLCAgIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLjMsICAgMC43LCAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAgMCwgICAgIDAsICAgMSwgMCIvPgogICAgPC9maWx0ZXI+CiAgICA8ZmlsdGVyIGlkPSJkZXV0ZXJhbm9tYWx5Ij4KICAgICAgPGZlQ29sb3JNYXRyaXgKICAgICAgICBpbj0iU291cmNlR3JhcGhpYyIKICAgICAgICB0eXBlPSJtYXRyaXgiCiAgICAgICAgdmFsdWVzPSIwLjgsICAgMC4yLCAgIDAsICAgICAwLCAwCiAgICAgICAgICAgICAgICAwLjI1OCwgMC43NDIsIDAsICAgICAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAgMC4xNDIsIDAuODU4LCAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAgMCwgICAgIDAsICAgICAxLCAwIi8+CiAgICA8L2ZpbHRlcj4KICAgIDxmaWx0ZXIgaWQ9InRyaXRhbm9waWEiPgogICAgICA8ZmVDb2xvck1hdHJpeAogICAgICAgIGluPSJTb3VyY2VHcmFwaGljIgogICAgICAgIHR5cGU9Im1hdHJpeCIKICAgICAgICB2YWx1ZXM9IjAuOTUsIDAuMDUsICAwLCAgICAgMCwgMAogICAgICAgICAgICAgICAgMCwgICAgMC40MzMsIDAuNTY3LCAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAwLjQ3NSwgMC41MjUsIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgIDAsICAgICAwLCAgICAgMSwgMCIvPgogICAgPC9maWx0ZXI+CiAgICA8ZmlsdGVyIGlkPSJ0cml0YW5vbWFseSI+CiAgICAgIDxmZUNvbG9yTWF0cml4CiAgICAgICAgaW49IlNvdXJjZUdyYXBoaWMiCiAgICAgICAgdHlwZT0ibWF0cml4IgogICAgICAgIHZhbHVlcz0iMC45NjcsIDAuMDMzLCAwLCAgICAgMCwgMAogICAgICAgICAgICAgICAgMCwgICAgIDAuNzMzLCAwLjI2NywgMCwgMAogICAgICAgICAgICAgICAgMCwgICAgIDAuMTgzLCAwLjgxNywgMCwgMAogICAgICAgICAgICAgICAgMCwgICAgIDAsICAgICAwLCAgICAgMSwgMCIvPgogICAgPC9maWx0ZXI+CiAgICA8ZmlsdGVyIGlkPSJhY2hyb21hdG9wc2lhIj4KICAgICAgPGZlQ29sb3JNYXRyaXgKICAgICAgICBpbj0iU291cmNlR3JhcGhpYyIKICAgICAgICB0eXBlPSJtYXRyaXgiCiAgICAgICAgdmFsdWVzPSIwLjI5OSwgMC41ODcsIDAuMTE0LCAwLCAwCiAgICAgICAgICAgICAgICAwLjI5OSwgMC41ODcsIDAuMTE0LCAwLCAwCiAgICAgICAgICAgICAgICAwLjI5OSwgMC41ODcsIDAuMTE0LCAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAgMCwgICAgIDAsICAgICAxLCAwIi8+CiAgICA8L2ZpbHRlcj4KICAgIDxmaWx0ZXIgaWQ9ImFjaHJvbWF0b21hbHkiPgogICAgICA8ZmVDb2xvck1hdHJpeAogICAgICAgIGluPSJTb3VyY2VHcmFwaGljIgogICAgICAgIHR5cGU9Im1hdHJpeCIKICAgICAgICB2YWx1ZXM9IjAuNjE4LCAwLjMyMCwgMC4wNjIsIDAsIDAKICAgICAgICAgICAgICAgIDAuMTYzLCAwLjc3NSwgMC4wNjIsIDAsIDAKICAgICAgICAgICAgICAgIDAuMTYzLCAwLjMyMCwgMC41MTYsIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLCAgICAgMCwgICAgIDEsIDAiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KPC9zdmc+Cg==';
    const css = `
      body {
       -webkit-filter: url('${xsltPath}#${colorDeficiency}');
        filter: url('${xsltPath}#${colorDeficiency}');
      }
      `;
    return applyCss(colorDeficiency, css);
  };

  const applySunlight = async (condition: string) => {
    const css = 'body {backdrop-filter: brightness(0.5) !important;}';
    return applyCss(condition, css);
  };

  const applyVisualImpairment = async (visualImpairment: string) => {
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
    let js = null;
    if (visualImpairment.toLowerCase() === 'glaucome') {
      js = String(`var div = document.createElement('div');
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
  };document.onmousemove = handleMouseMove;0`);
    }
    return applyCss(visualImpairment, css, js);
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

  const layoutDebug = async (cssPath: string) => {
    if (webview === null) {
      return;
    }
    const css = debugStylesheet[cssPath];
    applyCss(cssPath, css);
  };

  const toggleRulers = async () => {
    if (webview === null) {
      return;
    }
    toggleRuler();
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
        <Button onClick={toggleRulers} title="Show rulers">
          <Icon icon="tdesign:measurement-1" />
        </Button>
        <DropDown
          className="text-xs"
          label={<Icon icon="codicon:debug-line-by-line" fontSize={18} />}
          options={[
            {
              label: (
                <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                  <span className="font-bold">Debug</span>
                </div>
              ),
              onClick: null,
            },
            ...debuggers.map((x: string) => {
              return {
                label: (
                  <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                    <span
                      className={`ml-2 ${
                        injectCss?.name === x.toLowerCase()
                          ? 'font-semibold text-black'
                          : ''
                      }`}
                    >
                      {x}
                    </span>
                  </div>
                ),
                onClick: () => {
                  layoutDebug(x.toLowerCase());
                },
              };
            }),
            {
              label: (
                <div className="flex w-full flex-shrink-0 items-center justify-between gap-12 whitespace-nowrap">
                  <span className="font-bold">Accessibility Tools</span>
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
                <div className="flex w-full flex-shrink-0 items-center justify-start gap-12 whitespace-nowrap">
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
                  <div className="justify-normal flex w-full flex-shrink-0 items-center gap-1 whitespace-nowrap">
                    {injectCss?.name === x.toLowerCase() ? (
                      <Icon icon="ic:round-check" />
                    ) : (
                      <></>
                    )}
                    <span
                      className={`ml-2 ${
                        injectCss?.name === x.toLowerCase()
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
                  <div className="justify-normal flex w-full flex-shrink-0 items-center gap-1 whitespace-nowrap">
                    {injectCss?.name === x.toLowerCase() ? (
                      <Icon icon="ic:round-check" />
                    ) : (
                      <></>
                    )}
                    <span
                      className={`ml-2 ${
                        injectCss?.name === x.toLowerCase()
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
                <div className="flex w-full flex-shrink-0 items-center justify-between gap-1 whitespace-nowrap">
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
                  <div className="justify-normal flex w-full flex-shrink-0 items-center gap-1 whitespace-nowrap">
                    {injectCss?.name === x.toLowerCase() ? (
                      <Icon icon="ic:round-check" />
                    ) : (
                      <></>
                    )}
                    <span
                      className={`ml-2 ${
                        injectCss?.name === x.toLowerCase()
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
                <div className="flex w-full flex-shrink-0 items-center justify-between gap-1 whitespace-nowrap">
                  <span className="ml-1 font-semibold">Visual impairment</span>
                </div>
              ),
              onClick: null,
            },
            ...visualimpairments.map((x: string) => {
              return {
                label: (
                  <div className="justify-normal flex w-full flex-shrink-0 items-center gap-1 whitespace-nowrap">
                    {injectCss?.name === x.toLowerCase() ? (
                      <Icon icon="ic:round-check" />
                    ) : (
                      <></>
                    )}
                    <span
                      className={`ml-2 ${
                        injectCss?.name === x.toLowerCase()
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
                <div className="flex w-full flex-shrink-0 items-center justify-between gap-1 whitespace-nowrap">
                  <span className="ml-1 font-semibold">
                    Temporary impairment
                  </span>
                </div>
              ),
              onClick: null,
            },
            ...sunlight.map((x: string) => {
              return {
                label: (
                  <div className="justify-normal flex w-full flex-shrink-0 items-center gap-1 whitespace-nowrap">
                    {injectCss?.name === x.toLowerCase() ? (
                      <Icon icon="ic:round-check" />
                    ) : (
                      <></>
                    )}
                    <span
                      className={`ml-2 ${
                        injectCss?.name === x.toLowerCase()
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
