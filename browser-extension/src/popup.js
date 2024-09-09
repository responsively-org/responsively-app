import openCustomProtocolURI from "custom-protocol-check";
import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import spinner from "./spinner.svg";

const isChrome = () => {
  // IE11 returns undefined for window.chrome
  // and new Opera 30 outputs true for window.chrome
  // but needs to check if window.opr is not undefined
  // and new IE Edge outputs to true for window.chrome
  // and if not iOS Chrome check
  const isChromium = window.chrome;
  const winNav = window.navigator;
  const vendorName = winNav.vendor;
  const isOpera = typeof window.opr !== "undefined";
  const isIEedge = winNav.userAgent.indexOf("Edge") > -1;
  const isIOSChrome = winNav.userAgent.match("CriOS");
  return (
    (isChromium !== null &&
      typeof isChromium !== "undefined" &&
      vendorName === "Google Inc." &&
      isOpera === false &&
      isIEedge === false) ||
    isIOSChrome
  );
};

const URLOpenerNonChrome = () => {
  const [status, setStatus] = useState("loading");
  const checkProtocolAndUpdateStatus = useCallback(async () => {
    const [tab] = await window.browser.tabs.query({ currentWindow: true, active: true });
    if (!tab || !tab.url) {
      setStatus("false");
      return;
    }
    openCustomProtocolURI(
      `responsively://${tab.url}`,
      () => setStatus("false"),
      () => setStatus("true")
    );
  }, []);

  useEffect(() => {
    checkProtocolAndUpdateStatus();
  }, [checkProtocolAndUpdateStatus]);

  if (status === "loading") {
    return (
      <div className="popup">
        <div className="flexCenter">
          <img className="loadingSpinner" src={spinner} />
        </div>
      </div>
    );
  }
  if (status === "false") {
    return (
      <div className="popup">
        <div className="textJustify">
          It looks like you dont have Responsively App installed to preview the
          page in responsive mode.
        </div>
        <br />
        <br />
        <br />
        Please install the app and open it once to continue using the extension.
        <br />
        <div className="flexCenter">
          <a
            className="anchorButton"
            onClick={() => setTimeout(() => window.close(), 200)}
            href="https://responsively.app"
            target="_blank"
          >
            Install Now
          </a>
        </div>
      </div>
    );
  }
  return null;
};

const URLOpenerChrome = () => {
  const updateTabURL = useCallback(async () => {
    const [tab] = await window.browser.tabs.query({ currentWindow: true, active: true });
    if (!tab || !tab.url) {
      return;
    }
    window.browser.tabs.update({ url: `responsively://${tab.url}` });
  }, []);

  useEffect(() => {
    updateTabURL();
    setTimeout(() => {
      window.close();
    }, 5000);
  }, [updateTabURL]);

  return (
    <div className="popup">
      <div className="textJustify">
        If you have any issues seeing the responsive preview, please make sure
        Responsively app is installed.
      </div>
      <br />
      <br />
      <div className="flexCenter">
        <a
          className="anchorButton"
          onClick={() => setTimeout(() => window.close(), 200)}
          href="https://responsively.app"
          target="_blank"
        >
          Install Now
        </a>
      </div>
      <br />
      <br />
    </div>
  );
};

ReactDOM.render(
  isChrome() ? <URLOpenerChrome /> : <URLOpenerNonChrome />,
  document.getElementById("app")
);

// HMR integration
if (module.hot) {
  module.hot.accept('./popup', () => {
    const NextPopup = require('./popup').default;
    ReactDOM.render(<NextPopup />, document.getElementById('app'));
  });
}
