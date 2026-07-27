export const MATCH_TYPES = {
  CONTAINS: 'contains',
  EQUALS: 'equals',
  REGEX: 'regex',
  WILDCARD: 'wildcard',
  STARTS_WITH: 'startsWith',
  ENDS_WITH: 'endsWith',
} as const;

export type MatchType = (typeof MATCH_TYPES)[keyof typeof MATCH_TYPES];

export const HEADER_OPERATIONS = {
  SET: 'set',
  ADD: 'add',
  REMOVE: 'remove',
} as const;

export type HeaderOperation = (typeof HEADER_OPERATIONS)[keyof typeof HEADER_OPERATIONS];

export const HEADER_TYPES = {
  REQUEST: 'request',
  RESPONSE: 'response',
} as const;

export type HeaderType = (typeof HEADER_TYPES)[keyof typeof HEADER_TYPES];

/** Matches any resource type or any request method. */
export const ANY = 'any';

// Electron's webRequest resource types, see details.resourceType
export const RESOURCE_TYPES = [
  ANY,
  'mainFrame',
  'subFrame',
  'stylesheet',
  'script',
  'image',
  'font',
  'object',
  'xhr',
  'ping',
  'cspReport',
  'media',
  'webSocket',
  'other',
] as const;

export const REQUEST_METHODS = [
  ANY,
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
] as const;

export interface HeaderRuleCondition {
  id: string;
  matchType: MatchType;
  targetValue: string;
  resourceType: string;
  requestMethod: string;
  enabled: boolean;
}

export interface HeaderRuleAction {
  id: string;
  operation: HeaderOperation;
  headerType: HeaderType;
  headerName: string;
  headerValue: string;
  enabled: boolean;
}

export interface HeaderRule {
  id: string;
  enabled: boolean;
  conditions: HeaderRuleCondition[];
  actions: HeaderRuleAction[];
}

export interface RequestDetails {
  url: string;
  method?: string;
  resourceType?: string;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const matchesUrl = (matchType: MatchType, target: string, url: string): boolean => {
  const lowerCasedUrl = url.toLowerCase();
  const lowerCasedTarget = target.toLowerCase();
  switch (matchType) {
    case MATCH_TYPES.EQUALS:
      return lowerCasedUrl === lowerCasedTarget;
    case MATCH_TYPES.STARTS_WITH:
      return lowerCasedUrl.startsWith(lowerCasedTarget);
    case MATCH_TYPES.ENDS_WITH:
      return lowerCasedUrl.endsWith(lowerCasedTarget);
    case MATCH_TYPES.WILDCARD:
      return new RegExp(`^${target.split('*').map(escapeRegExp).join('.*')}$`, 'i').test(url);
    case MATCH_TYPES.REGEX:
      try {
        return new RegExp(target, 'i').test(url);
      } catch {
        return false;
      }
    case MATCH_TYPES.CONTAINS:
    default:
      return lowerCasedUrl.includes(lowerCasedTarget);
  }
};

const matchesCondition = (condition: HeaderRuleCondition, request: RequestDetails): boolean => {
  const target = condition.targetValue.trim();
  if (!condition.enabled || target === '') {
    return false;
  }
  if (
    condition.resourceType !== ANY &&
    request.resourceType != null &&
    condition.resourceType !== request.resourceType
  ) {
    return false;
  }
  if (
    condition.requestMethod !== ANY &&
    request.method != null &&
    condition.requestMethod.toUpperCase() !== request.method.toUpperCase()
  ) {
    return false;
  }
  return matchesUrl(condition.matchType, target, request.url);
};

/** A rule matches when it is enabled and all of its enabled conditions match. */
export const getMatchingRules = (rules: HeaderRule[], request: RequestDetails): HeaderRule[] => {
  if (rules == null || request?.url == null) {
    return [];
  }
  return rules.filter((rule) => {
    if (!rule.enabled) {
      return false;
    }
    const enabledConditions = rule.conditions.filter((condition) => condition.enabled);
    return (
      enabledConditions.length > 0 &&
      enabledConditions.every((condition) => matchesCondition(condition, request))
    );
  });
};

/** Without a headerType, request and response actions are returned together. */
export const getMatchingActions = (
  rules: HeaderRule[],
  request: RequestDetails,
  headerType?: HeaderType
): HeaderRuleAction[] =>
  getMatchingRules(rules, request).flatMap((rule) =>
    rule.actions.filter(
      (action) =>
        action.enabled &&
        action.headerName.trim() !== '' &&
        (headerType == null || action.headerType === headerType)
    )
  );

/**
 * Applies the actions to a copy of the given headers, keeping the existing header casing.
 * Response headers hold arrays of values, request headers hold plain strings.
 */
export const applyHeaderActions = <T extends string | string[]>(
  actions: HeaderRuleAction[],
  headers: Record<string, T>,
  multiValue = false
): Record<string, T> => {
  const updatedHeaders = {...headers};

  actions.forEach((action) => {
    const name = action.headerName.trim();
    const existingKey =
      Object.keys(updatedHeaders).find((key) => key.toLowerCase() === name.toLowerCase()) ?? name;
    const existingValue = updatedHeaders[existingKey];

    if (action.operation === HEADER_OPERATIONS.REMOVE) {
      delete updatedHeaders[existingKey];
      return;
    }

    if (action.operation === HEADER_OPERATIONS.ADD && existingValue != null) {
      updatedHeaders[existingKey] = (
        Array.isArray(existingValue)
          ? [...existingValue, action.headerValue]
          : `${existingValue}, ${action.headerValue}`
      ) as T;
      return;
    }

    updatedHeaders[existingKey] = (multiValue ? [action.headerValue] : action.headerValue) as T;
  });

  return updatedHeaders;
};

/** webRequest entry point: picks the matching actions and applies them to the given headers. */
export const applyRulesToHeaders = <T extends string | string[]>(
  rules: HeaderRule[],
  request: RequestDetails,
  headerType: HeaderType,
  headers: Record<string, T>
): Record<string, T> =>
  applyHeaderActions(
    getMatchingActions(rules, request, headerType),
    headers,
    headerType === HEADER_TYPES.RESPONSE
  );
