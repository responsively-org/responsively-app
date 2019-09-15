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

  const sendMessage = (action, data) => {
    if (!isOpen) {
      console.log('WS connection not open', socket.readyState);
      throw new Error('WS connection not open', socket.readyState);
    }
    socket.send(JSON.stringify({action, data}));
  };

  socket.onmessage = ({data: messageString}) => {
    console.log('newMessage', messageString);
    const message = JSON.parse(messageString);
    const {action, data} = message;
    onMessage(action, data);
  };
  return {socket, sendMessage};
}

export function cleanUp(socketInstance) {
  if (!socketInstance) {
    return;
  }
  if (socketInstance.readyState === 1) {
    socketInstance.close();
  }
}

export function destroyWS(ws) {}
