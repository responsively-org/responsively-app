// @flow
export type Device = {
  id: number,
  added: boolean,
  width: number,
  height: number,
  name: string,
  useragent: string,
};

export default [
  {
    id: 1,
    added: true,
    width: 320,
    height: 568,
    name: 'iPhone SE',
    useragent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/75.0.3770.70 Mobile/14E5239e Safari/602.1',
  },
  {
    id: 2,
    added: true,
    width: 375,
    height: 812,
    name: 'iPhone X',
    useragent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/75.0.3770.70 Mobile/14E5239e Safari/602.1',
  },
  {
    id: 3,
    added: true,
    width: 768,
    height: 1024,
    name: 'iPad',
    useragent:
      'Mozilla/5.0 (iPad; CPU OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/75.0.3770.70 Mobile/13G36 Safari/602.1',
  },
  {
    id: 4,
    added: true,
    width: 1024,
    height: 1366,
    name: 'iPad Pro',
    useragent:
      'Mozilla/5.0 (iPad; CPU OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/75.0.3770.70 Mobile/13G36 Safari/602.1',
  },
  {
    id: 5,
    added: true,
    width: 1440,
    height: 900,
    name: 'Laptop',
    useragent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
  },
];
