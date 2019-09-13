import WebSocket from 'isomorphic-ws';

export function initWS(url, onMessage) {
  let isOpen = false;
  const socket = new WebSocket(url);
  socket.onopen = () => {
    console.log('WS open');
    isOpen = true;
  };
  socket.onclose = () => {
    console.log('WS close');
    isOpen = false;
  };

  const sendMessage = (type, message) => {
    if (!isOpen) {
      throw new Error('WS connection not open');
    }
    socket.send(JSON.stringify({type, message}));
  };
  socket.onmessage = data => {
    const {type, message} = JSON.parse(data);
    onMessage(type, message);
  };
  return {socket, sendMessage};
}

export function destroyWS(ws) {}
