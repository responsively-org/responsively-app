import {
  ANY,
  HeaderRule,
  HeaderRuleAction,
  HeaderRuleCondition,
  applyHeaderActions,
  getMatchingActions,
  getMatchingRules,
} from './headerRules';

const condition = (overrides: Partial<HeaderRuleCondition> = {}): HeaderRuleCondition => ({
  id: 'c1',
  matchType: 'contains',
  targetValue: 'preprod.example.com',
  resourceType: ANY,
  requestMethod: ANY,
  enabled: true,
  ...overrides,
});

const action = (overrides: Partial<HeaderRuleAction> = {}): HeaderRuleAction => ({
  id: 'a1',
  operation: 'set',
  headerType: 'request',
  headerName: 'x-control',
  headerValue: 'secret',
  enabled: true,
  ...overrides,
});

const rule = (overrides: Partial<HeaderRule> = {}): HeaderRule => ({
  id: 'r1',
  enabled: true,
  conditions: [condition()],
  actions: [action()],
  ...overrides,
});

describe('getMatchingRules', () => {
  it('supports every match type', () => {
    const url = 'https://preprod.example.com/news';
    const matches = (overrides: Partial<HeaderRuleCondition>) =>
      getMatchingRules([rule({conditions: [condition(overrides)]})], {url}).length === 1;

    expect(matches({matchType: 'contains', targetValue: 'PREPROD.example'})).toBe(true);
    expect(matches({matchType: 'equals', targetValue: url})).toBe(true);
    expect(matches({matchType: 'equals', targetValue: 'https://preprod.example.com'})).toBe(false);
    expect(matches({matchType: 'startsWith', targetValue: 'https://preprod'})).toBe(true);
    expect(matches({matchType: 'endsWith', targetValue: '/news'})).toBe(true);
    expect(matches({matchType: 'wildcard', targetValue: 'https://*.example.com/*'})).toBe(true);
    expect(matches({matchType: 'wildcard', targetValue: 'https://*.other.com/*'})).toBe(false);
    expect(matches({matchType: 'regex', targetValue: '^https://preprod\\..*/news$'})).toBe(true);
    expect(matches({matchType: 'regex', targetValue: '('})).toBe(false);
  });

  it('filters on resource type and request method', () => {
    const request = {url: 'https://preprod.example.com/', method: 'POST', resourceType: 'xhr'};

    expect(getMatchingRules([rule()], request)).toHaveLength(1);
    expect(
      getMatchingRules([rule({conditions: [condition({resourceType: 'script'})]})], request)
    ).toHaveLength(0);
    expect(
      getMatchingRules([rule({conditions: [condition({requestMethod: 'GET'})]})], request)
    ).toHaveLength(0);
    expect(
      getMatchingRules([rule({conditions: [condition({requestMethod: 'POST'})]})], request)
    ).toHaveLength(1);
  });

  it('requires all enabled conditions to match and skips disabled rules', () => {
    const request = {url: 'https://preprod.example.com/'};
    const twoConditions = [condition(), condition({id: 'c2', targetValue: 'staging'})];

    expect(getMatchingRules([rule({conditions: twoConditions})], request)).toHaveLength(0);
    expect(getMatchingRules([rule({enabled: false})], request)).toHaveLength(0);
    expect(getMatchingRules([rule({conditions: []})], request)).toHaveLength(0);
    expect(
      getMatchingRules([rule({conditions: [condition({targetValue: '  '})]})], request)
    ).toHaveLength(0);
  });
});

describe('getMatchingActions', () => {
  it('only returns enabled actions of the requested header type', () => {
    const request = {url: 'https://preprod.example.com/'};
    const actions = [
      action(),
      action({id: 'a2', headerType: 'response'}),
      action({id: 'a3', enabled: false}),
      action({id: 'a4', headerName: ' '}),
    ];

    expect(getMatchingActions([rule({actions})], request, 'request')).toEqual([actions[0]]);
    expect(getMatchingActions([rule({actions})], request, 'response')).toEqual([actions[1]]);
  });
});

describe('applyHeaderActions', () => {
  it('sets, adds and removes headers case insensitively', () => {
    expect(applyHeaderActions([action()], {'X-Control': 'old'})).toEqual({'X-Control': 'secret'});
    expect(applyHeaderActions([action()], {})).toEqual({'x-control': 'secret'});
    expect(applyHeaderActions([action({operation: 'add'})], {'x-control': 'old'})).toEqual({
      'x-control': 'old, secret',
    });
    expect(applyHeaderActions([action({operation: 'remove'})], {'X-Control': 'old'})).toEqual({});
  });

  it('keeps response headers as arrays', () => {
    expect(applyHeaderActions([action()], {} as Record<string, string[]>, true)).toEqual({
      'x-control': ['secret'],
    });
    expect(applyHeaderActions([action({operation: 'add'})], {'x-control': ['old']}, true)).toEqual({
      'x-control': ['old', 'secret'],
    });
  });
});
