import Bluebird from 'bluebird';
import PubSub from '.';

async function testBasicPubSub() {
  const pubsub = new PubSub();
  let invokedTest = false;
  pubsub.subscribe('test', () => {
    invokedTest = true;
  });
  await pubsub.publish('test');

  console.assert(invokedTest, 'PubSub should invoke subscribed callback');
}

const testAsyncReturnValue = async () => {
  const pubsub = new PubSub();
  pubsub.subscribe('test', async () => {
    await Bluebird.delay(1000);
    return 'handler1';
  });
  pubsub.subscribe('test', async () => {
    await Bluebird.delay(2000);
    return 'handler2';
  });

  const results = await pubsub.publish('test');
  console.assert(results.length === 2, 'PubSub should return array of results');
  console.assert(
    results[0].result === 'handler1',
    'PubSub should return result of first handler'
  );
  console.assert(
    results[1].result === 'handler2',
    'PubSub should return result of second handler'
  );
};

async function testArgsToHandler() {
  const pubsub = new PubSub();
  pubsub.subscribe('test', (arg: number) => {
    return `test${arg}`;
  });
  const results = await pubsub.publish('test', 10);
  console.assert(results.length === 1, 'PubSub should return array of results');
  console.assert(
    results[0].result === 'test10',
    'PubSub should return result of first handler'
  );
}

async function testHandlerWithErr() {
  const pubsub = new PubSub();
  pubsub.subscribe('test', () => {
    throw new Error('test');
  });
  const results = await pubsub.publish('test');
  console.assert(results.length === 1, 'PubSub should return array of results');
  console.assert(results[0].result == null, 'PubSub should return null result');
  console.assert(results[0].error != null, 'PubSub should return an error');
}

const test = async () => {
  await testBasicPubSub();
  await testAsyncReturnValue();
  await testArgsToHandler();
  await testHandlerWithErr();
};

test()
  .then(() => console.log('Test successful'))
  .catch((err) => console.log('Test failure: ', err));
