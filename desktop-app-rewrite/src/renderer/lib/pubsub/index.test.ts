import Bluebird from 'bluebird';
import PubSub from '.';

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
      await Bluebird.delay(1000);
      return 'handler1';
    });
    pubsub.subscribe('test', async () => {
      await Bluebird.delay(2000);
      return 'handler2';
    });

    const results = await pubsub.publish('test');
    expect(results).toEqual([
      { result: 'handler1', error: null },
      { result: 'handler2', error: null },
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
});
