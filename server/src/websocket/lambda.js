export async function connectionHandler(event, context, callback) {
  return {
    statusCode: 200,
    body: 'Message recieved',
  };
}

export async function defaultHandler(event, context, callback) {
  return {
    statusCode: 200,
    body: 'Message recieved',
  };
}

export async function pingHandler(event, context, callback) {
  return {
    statusCode: 200,
    body: 'Message recieved',
  };
}
