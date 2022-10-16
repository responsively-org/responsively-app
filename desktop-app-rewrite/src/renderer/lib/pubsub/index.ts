import Bluebird from 'bluebird';

interface HandlerResult {
  result: any;
  error: any;
}

type Handler = ((...args: any) => void) | ((...args: any) => Promise<any>);

class PubSub {
  registry: { [key: string]: Handler[] };

  constructor() {
    this.registry = {};
  }

  subscribe = (topic: string, callback: Handler): void => {
    if (!this.registry[topic]) {
      this.registry[topic] = [];
    }
    this.registry[topic].push(callback);
  };

  unsubscribe = (topic: string, callback: Handler): void => {
    if (!this.registry[topic]) {
      return;
    }
    const index = this.registry[topic].indexOf(callback);
    if (index > -1) {
      this.registry[topic].splice(index, 1);
    }
  };

  publish = async (topic: string, ...args: any[]): Promise<HandlerResult[]> => {
    if (!this.registry[topic]) {
      return [];
    }

    return Bluebird.map(this.registry[topic], async (callback: Handler) => {
      try {
        return { result: await callback(...args), error: null };
      } catch (err) {
        return { result: null, error: err };
      }
    });
  };
}

export const webViewPubSub = new PubSub();

export default PubSub;
