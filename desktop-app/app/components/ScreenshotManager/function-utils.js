import Promise from 'bluebird';

export const _delay = (ms: number): Promise<any> =>
  new Promise((resolve, _) => {
    setTimeout(() => resolve(), ms);
  });
