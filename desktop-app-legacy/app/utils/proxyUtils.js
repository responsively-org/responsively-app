export function proxyRuleToString(scheme, rule, defaultRule) {
  let str = scheme === 'default' ? '' : `${scheme}=`;
  if (rule.useDefault) return str + defaultRule;
  if (rule.protocol === 'direct') return `${str}direct://`;
  str = `${str}${rule.protocol}://${rule.server}`;
  if (rule.port != null) str = `${str}:${rule.port}`;
  return defaultRule !== '' ? `${str},${defaultRule}` : str;
}

export function convertToProxyConfig(profile) {
  if (!profile.active) {
    return {
      proxyRules: 'direct://',
    };
  }
  const defaultStr = proxyRuleToString('default', profile.default, '');
  const parts = [
    proxyRuleToString('http', profile.http, defaultStr),
    proxyRuleToString('https', profile.https, defaultStr),
    proxyRuleToString('ftp', profile.ftp, defaultStr),
  ];

  return {
    proxyRules: parts.join(';'),
    proxyBypassRules: (profile.bypassList || []).join(','),
  };
}

export function getEmptyProxySchemeConfig(useDefault = false) {
  return {
    protocol: '',
    server: '',
    port: '',
    user: '',
    password: '',
    useDefault: !!useDefault,
  };
}
