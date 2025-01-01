import { Icon } from '@iconify/react';
import cx from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { DropDown } from 'renderer/components/DropDown';
import { COLOR_BLINDNESS_CHANNEL } from 'renderer/components/ToolBar/ColorBlindnessControls';
import {
  BLUE_YELLOW,
  FULL,
  RED_GREEN,
  SIMULATIONS,
  SUNLIGHT,
  VISUAL_IMPAIRMENTS,
  VisionSimulationDropDown,
} from 'renderer/components/VisionSimulationDropDown';
import { webViewPubSub } from 'renderer/lib/pubsub';

interface InjectedCss {
  key: string;
  css: string;
  js: string | null;
  name: string;
}

interface Props {
  webview: Electron.WebviewTag | null;
}

export const ColorBlindnessTools = ({ webview }: Props) => {
  const [injectCss, setInjectCss] = useState<InjectedCss>();

  const reApplyCss = useCallback(async () => {
    if (webview === null) {
      return;
    }
    if (injectCss === undefined) {
      return;
    }
    const key = await webview.insertCSS(injectCss.css);
    if (injectCss.js != null) {
      await webview.executeJavaScript(injectCss.js);
    }

    setInjectCss({ ...injectCss, key });
  }, [webview, injectCss, setInjectCss]);

  const applyCss = useCallback(
    async (debugType: string, css: string, js: string | null = null) => {
      if (webview === null) {
        return;
      }
      if (css === undefined) {
        return;
      }

      if (injectCss !== undefined) {
        if (injectCss.name === debugType) {
          return;
        }
        if (injectCss.js !== null) {
          webview.reload();
        }
        await webview.removeInsertedCSS(injectCss.key);
        setInjectCss(undefined);
      }

      try {
        const key = await webview.insertCSS(css);
        if (js !== null) {
          await webview.executeJavaScript(js);
        }
        setInjectCss({ key, css, name: debugType, js });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error inserting css', error);
        // dispatch(setCss(undefined));
        setInjectCss(undefined);
      }
    },
    [setInjectCss, webview, injectCss]
  );

  const clearSimulation = useCallback(async () => {
    if (webview === null) {
      return;
    }
    if (injectCss === undefined) {
      return;
    }
    await webview.removeInsertedCSS(injectCss.key);
    setInjectCss(undefined);
  }, [webview, injectCss, setInjectCss]);

  useEffect(() => {
    if (webview === null) {
      return () => {};
    }
    const handler = async () => {
      reApplyCss();
    };

    webview.addEventListener('did-navigate', handler);

    return () => {
      webview.removeEventListener('did-navigate', handler);
    };
  }, [webview, reApplyCss]);

  const applyColorDeficiency = useCallback(
    async (colorDeficiency: string) => {
      const xsltPath =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgdmVyc2lvbj0iMS4xIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9InByb3Rhbm9waWEiPgogICAgICA8ZmVDb2xvck1hdHJpeAogICAgICAgIGluPSJTb3VyY2VHcmFwaGljIgogICAgICAgIHR5cGU9Im1hdHJpeCIKICAgICAgICB2YWx1ZXM9IjAuNTY3LCAwLjQzMywgMCwgICAgIDAsIDAKICAgICAgICAgICAgICAgIDAuNTU4LCAwLjQ0MiwgMCwgICAgIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLjI0MiwgMC43NTgsIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLCAgICAgMCwgICAgIDEsIDAiLz4KICAgIDwvZmlsdGVyPgogICAgPGZpbHRlciBpZD0icHJvdGFub21hbHkiPgogICAgICA8ZmVDb2xvck1hdHJpeAogICAgICAgIGluPSJTb3VyY2VHcmFwaGljIgogICAgICAgIHR5cGU9Im1hdHJpeCIKICAgICAgICB2YWx1ZXM9IjAuODE3LCAwLjE4MywgMCwgICAgIDAsIDAKICAgICAgICAgICAgICAgIDAuMzMzLCAwLjY2NywgMCwgICAgIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLjEyNSwgMC44NzUsIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLCAgICAgMCwgICAgIDEsIDAiLz4KICAgIDwvZmlsdGVyPgogICAgPGZpbHRlciBpZD0iZGV1dGVyYW5vcGlhIj4KICAgICAgPGZlQ29sb3JNYXRyaXgKICAgICAgICBpbj0iU291cmNlR3JhcGhpYyIKICAgICAgICB0eXBlPSJtYXRyaXgiCiAgICAgICAgdmFsdWVzPSIwLjYyNSwgMC4zNzUsIDAsICAgMCwgMAogICAgICAgICAgICAgICAgMC43LCAgIDAuMywgICAwLCAgIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLjMsICAgMC43LCAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAgMCwgICAgIDAsICAgMSwgMCIvPgogICAgPC9maWx0ZXI+CiAgICA8ZmlsdGVyIGlkPSJkZXV0ZXJhbm9tYWx5Ij4KICAgICAgPGZlQ29sb3JNYXRyaXgKICAgICAgICBpbj0iU291cmNlR3JhcGhpYyIKICAgICAgICB0eXBlPSJtYXRyaXgiCiAgICAgICAgdmFsdWVzPSIwLjgsICAgMC4yLCAgIDAsICAgICAwLCAwCiAgICAgICAgICAgICAgICAwLjI1OCwgMC43NDIsIDAsICAgICAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAgMC4xNDIsIDAuODU4LCAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAgMCwgICAgIDAsICAgICAxLCAwIi8+CiAgICA8L2ZpbHRlcj4KICAgIDxmaWx0ZXIgaWQ9InRyaXRhbm9waWEiPgogICAgICA8ZmVDb2xvck1hdHJpeAogICAgICAgIGluPSJTb3VyY2VHcmFwaGljIgogICAgICAgIHR5cGU9Im1hdHJpeCIKICAgICAgICB2YWx1ZXM9IjAuOTUsIDAuMDUsICAwLCAgICAgMCwgMAogICAgICAgICAgICAgICAgMCwgICAgMC40MzMsIDAuNTY3LCAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAwLjQ3NSwgMC41MjUsIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgIDAsICAgICAwLCAgICAgMSwgMCIvPgogICAgPC9maWx0ZXI+CiAgICA8ZmlsdGVyIGlkPSJ0cml0YW5vbWFseSI+CiAgICAgIDxmZUNvbG9yTWF0cml4CiAgICAgICAgaW49IlNvdXJjZUdyYXBoaWMiCiAgICAgICAgdHlwZT0ibWF0cml4IgogICAgICAgIHZhbHVlcz0iMC45NjcsIDAuMDMzLCAwLCAgICAgMCwgMAogICAgICAgICAgICAgICAgMCwgICAgIDAuNzMzLCAwLjI2NywgMCwgMAogICAgICAgICAgICAgICAgMCwgICAgIDAuMTgzLCAwLjgxNywgMCwgMAogICAgICAgICAgICAgICAgMCwgICAgIDAsICAgICAwLCAgICAgMSwgMCIvPgogICAgPC9maWx0ZXI+CiAgICA8ZmlsdGVyIGlkPSJhY2hyb21hdG9wc2lhIj4KICAgICAgPGZlQ29sb3JNYXRyaXgKICAgICAgICBpbj0iU291cmNlR3JhcGhpYyIKICAgICAgICB0eXBlPSJtYXRyaXgiCiAgICAgICAgdmFsdWVzPSIwLjI5OSwgMC41ODcsIDAuMTE0LCAwLCAwCiAgICAgICAgICAgICAgICAwLjI5OSwgMC41ODcsIDAuMTE0LCAwLCAwCiAgICAgICAgICAgICAgICAwLjI5OSwgMC41ODcsIDAuMTE0LCAwLCAwCiAgICAgICAgICAgICAgICAwLCAgICAgMCwgICAgIDAsICAgICAxLCAwIi8+CiAgICA8L2ZpbHRlcj4KICAgIDxmaWx0ZXIgaWQ9ImFjaHJvbWF0b21hbHkiPgogICAgICA8ZmVDb2xvck1hdHJpeAogICAgICAgIGluPSJTb3VyY2VHcmFwaGljIgogICAgICAgIHR5cGU9Im1hdHJpeCIKICAgICAgICB2YWx1ZXM9IjAuNjE4LCAwLjMyMCwgMC4wNjIsIDAsIDAKICAgICAgICAgICAgICAgIDAuMTYzLCAwLjc3NSwgMC4wNjIsIDAsIDAKICAgICAgICAgICAgICAgIDAuMTYzLCAwLjMyMCwgMC41MTYsIDAsIDAKICAgICAgICAgICAgICAgIDAsICAgICAwLCAgICAgMCwgICAgIDEsIDAiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KPC9zdmc+Cg==';
      const css = `
      body {
       -webkit-filter: url('${xsltPath}#${colorDeficiency}');
        filter: url('${xsltPath}#${colorDeficiency}');
      }
      `;
      return applyCss(colorDeficiency, css);
    },
    [applyCss]
  );

  const applySunlight = useCallback(
    async (condition: string) => {
      const css = 'body {backdrop-filter: brightness(0.5) !important;}';
      return applyCss(condition, css);
    },
    [applyCss]
  );

  const applyVisualImpairment = useCallback(
    async (visualImpairment: string) => {
      const blur =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8ZGVmcz4KICAgICAgICA8ZmlsdGVyIGlkPSJnYXVzc2lhbl9ibHVyIj4KICAgICAgICAgICAgPGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjEwIiAvPgogICAgICAgIDwvZmlsdGVyPgogICAgPC9kZWZzPgo8L3N2Zz4=';

      const impairments: { [key: string]: string } = {
        [SIMULATIONS.CATARACT]: `body {
       -webkit-filter: url('${blur}#gaussian_blur');
        filter: url('${blur}#gaussian_blur');
      }`,
        [SIMULATIONS.GLAUCOME]: `#bigoverlay {
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
        [SIMULATIONS.FAR]: `body { filter: blur(2px); }`,
        [SIMULATIONS.COLOR_CONTRAST_LOSS]: `body { filter: grayscale(0.5) contrast(0.8); }`,
      };
      const css = impairments[visualImpairment.toLowerCase()];
      let js = null;
      if (visualImpairment.toLowerCase() === SIMULATIONS.GLAUCOME) {
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
    },
    [applyCss]
  );

  const applySimulation = useCallback(
    async (simulation = '') => {
      if (
        RED_GREEN.indexOf(simulation) !== -1 ||
        BLUE_YELLOW.indexOf(simulation) !== -1 ||
        FULL.indexOf(simulation) !== -1
      ) {
        return applyColorDeficiency(simulation);
      }

      if (VISUAL_IMPAIRMENTS.indexOf(simulation) !== -1) {
        return applyVisualImpairment(simulation);
      }

      if (SUNLIGHT.indexOf(simulation) !== -1) {
        return applySunlight(simulation);
      }

      return clearSimulation();
    },
    [
      applyColorDeficiency,
      applyVisualImpairment,
      applySunlight,
      clearSimulation,
    ]
  );

  useEffect(() => {
    const handler = ({ simulationName }: { simulationName: string }) => {
      applySimulation(simulationName);
    };
    webViewPubSub.subscribe(COLOR_BLINDNESS_CHANNEL, handler);

    return () => {
      webViewPubSub.unsubscribe(COLOR_BLINDNESS_CHANNEL, handler);
    };
  }, [applySimulation]);

  return (
    <VisionSimulationDropDown
      simulationName={injectCss?.name}
      onChange={applySimulation}
    />
  );
};
