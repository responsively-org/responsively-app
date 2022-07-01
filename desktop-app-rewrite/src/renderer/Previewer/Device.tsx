import { useEffect, useRef } from 'react';

interface Props {
  url: string;
  width: number;
  height: number;
}

const Device = ({ url, height, width }: Props) => {
  const ref = useRef<HTMLWebViewElement>(null);

  useEffect(() => {
    console.log('In useEffect');
    if (!ref.current) {
      console.log('Webview is null');
      return;
    }
    const webview = ref.current as HTMLWebViewElement;
    webview.addEventListener('dom-ready', function () {
      console.log('dom-ready');
      //webview.openDevtools();
    });
    console.log('Added listerner');
  }, [ref]);

  return (
    <div>
      <webview
        src={url}
        style={{ height, width, display: 'inline-flex' }}
        ref={ref}
      />
    </div>
  );
};

export default Device;
