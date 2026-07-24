import PubSub from '.';

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

describe('PubSub', () => {
  it('should invoke subscribed callback', async () => {
    const pubsub = new PubSub();
    let invokedTest = false;
    pubsub.subscribe('test', () => {
      invokedTest = true;
    });
    await pubsub.publish('test');
    expect(invokedTest).toBe(true);
  });

  it('should handler async handlers', async () => {
    const pubsub = new PubSub();
    pubsub.subscribe('test', async () => {
      await delay(20);
      return 'handler1';
    });
    pubsub.subscribe('test', async () => {
      await delay(40);
      return 'handler2';
    });

    const results = await pubsub.publish('test');
    expect(results).toEqual([
      {result: 'handler1', error: null},
      {result: 'handler2', error: null},
    ]);
  });

  it('should sends args to the handler', async () => {
    const pubsub = new PubSub();
    pubsub.subscribe('test', (arg: number) => {
      return `test${arg}`;
    });
    const results = await pubsub.publish('test', 10);
    expect(results).toHaveLength(1);
    expect(results[0].result).toBe('test10');
  });

  it('should return error from the handler', async () => {
    const pubsub = new PubSub();
    pubsub.subscribe('test', () => {
      throw new Error('test');
    });
    const results = await pubsub.publish('test');
    expect(results).toHaveLength(1);
    expect(results[0].result).toBeNull();
    expect(results[0].error).not.toBeNull();
  });

  it('should stop invoking a handler after unsubscribe', async () => {
    const pubsub = new PubSub();
    let count = 0;
    const handler = () => {
      count += 1;
    };
    pubsub.subscribe('test', handler);
    await pubsub.publish('test');
    pubsub.unsubscribe('test', handler);
    await pubsub.publish('test');
    expect(count).toBe(1);
  });
});
