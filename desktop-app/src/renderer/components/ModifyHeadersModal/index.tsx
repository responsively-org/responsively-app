import {Icon} from '@iconify/react';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {v4 as uuidv4} from 'uuid';
import {
  ANY,
  HEADER_OPERATIONS,
  HEADER_TYPES,
  HeaderRule,
  HeaderRuleAction,
  HeaderRuleCondition,
  MATCH_TYPES,
  REQUEST_METHODS,
  RESOURCE_TYPES,
} from 'common/headerRules';
import Button from 'renderer/components/Button';
import Modal from 'renderer/components/Modal';
import Toggle from 'renderer/components/Toggle';
import {webViewPubSub} from 'renderer/lib/pubsub';
import {
  selectHeaderRules,
  selectIsHeaderRulesModalOpen,
  setHeaderRules,
  setHeaderRulesModalOpen,
} from 'renderer/store/features/header-rules';
import {NAVIGATION_EVENTS} from '../ToolBar/NavigationControls';

const MATCH_TYPE_LABELS: Record<string, string> = {
  [MATCH_TYPES.CONTAINS]: 'Contains',
  [MATCH_TYPES.EQUALS]: 'Equals',
  [MATCH_TYPES.REGEX]: 'Regex',
  [MATCH_TYPES.WILDCARD]: 'Wildcard',
  [MATCH_TYPES.STARTS_WITH]: 'Starts with',
  [MATCH_TYPES.ENDS_WITH]: 'Ends with',
};

// ponytail: one flat list for both request and response headers, split per headerType if it gets noisy
const STANDARD_HTTP_HEADERS = [
  'Accept',
  'Accept-CH',
  'Accept-Charset',
  'Accept-Encoding',
  'Accept-Language',
  'Accept-Ranges',
  'Access-Control-Allow-Credentials',
  'Access-Control-Allow-Headers',
  'Access-Control-Allow-Methods',
  'Access-Control-Allow-Origin',
  'Access-Control-Expose-Headers',
  'Access-Control-Max-Age',
  'Access-Control-Request-Headers',
  'Access-Control-Request-Method',
  'Age',
  'Allow',
  'Authorization',
  'Cache-Control',
  'Connection',
  'Content-Disposition',
  'Content-Encoding',
  'Content-Language',
  'Content-Length',
  'Content-Location',
  'Content-Range',
  'Content-Security-Policy',
  'Content-Security-Policy-Report-Only',
  'Content-Type',
  'Cookie',
  'DNT',
  'Date',
  'ETag',
  'Expires',
  'Host',
  'If-Match',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Keep-Alive',
  'Last-Modified',
  'Location',
  'Origin',
  'Pragma',
  'Proxy-Authorization',
  'Range',
  'Referer',
  'Server',
  'Set-Cookie',
  'Strict-Transport-Security',
  'TE',
  'Transfer-Encoding',
  'User-Agent',
  'Vary',
  'Via',
  'WWW-Authenticate',
  'Warning',
  'X-Content-Type-Options',
  'X-Correlation-ID',
  'X-Forwarded-For',
  'X-Forwarded-Host',
  'X-Forwarded-Proto',
  'X-Frame-Options',
  'X-Request-ID',
  'X-Requested-With',
  'X-XSS-Protection',
];

const fieldClassName =
  'rounded-md border border-gray-300 px-2 py-1 text-sm focus-visible:outline-gray-400 dark:border-gray-500 dark:bg-slate-900';

const newCondition = (): HeaderRuleCondition => ({
  id: uuidv4(),
  matchType: MATCH_TYPES.CONTAINS,
  targetValue: '',
  resourceType: ANY,
  requestMethod: ANY,
  enabled: true,
});

const newAction = (): HeaderRuleAction => ({
  id: uuidv4(),
  operation: HEADER_OPERATIONS.SET,
  headerType: HEADER_TYPES.REQUEST,
  headerName: '',
  headerValue: '',
  enabled: true,
});

const newRule = (): HeaderRule => ({
  id: uuidv4(),
  enabled: true,
  conditions: [newCondition()],
  actions: [newAction()],
});

const AddButton = ({label, onClick}: {label: string; onClick: () => void}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1 rounded-md border border-dashed border-gray-400 px-2 py-1 text-xs text-gray-600 transition-colors hover:border-gray-600 hover:text-gray-900 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-300 dark:hover:text-white"
  >
    <Icon icon="mdi:plus" />
    {label}
  </button>
);

const DeleteButton = ({title, onClick}: {title: string; onClick: () => void}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-red-600 dark:hover:bg-slate-700"
  >
    <Icon icon="mdi:delete-outline" />
  </button>
);

const ModifyHeadersModal = () => {
  const isOpen = useSelector(selectIsHeaderRulesModalOpen);
  const savedRules = useSelector(selectHeaderRules);
  const [rules, setRules] = useState<HeaderRule[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      setRules(savedRules.length > 0 ? savedRules : [newRule()]);
    }
  }, [isOpen, savedRules]);

  const onClose = () => dispatch(setHeaderRulesModalOpen(false));

  const updateRule = (ruleId: string, changes: Partial<HeaderRule>) =>
    setRules(rules.map((rule) => (rule.id === ruleId ? {...rule, ...changes} : rule)));

  const updateCondition = (
    rule: HeaderRule,
    conditionId: string,
    changes: Partial<HeaderRuleCondition>
  ) =>
    updateRule(rule.id, {
      conditions: rule.conditions.map((condition) =>
        condition.id === conditionId ? {...condition, ...changes} : condition
      ),
    });

  const updateAction = (rule: HeaderRule, actionId: string, changes: Partial<HeaderRuleAction>) =>
    updateRule(rule.id, {
      actions: rule.actions.map((action) =>
        action.id === actionId ? {...action, ...changes} : action
      ),
    });

  const onSave = () => {
    const cleanedRules = rules
      .map((rule) => ({
        ...rule,
        conditions: rule.conditions.filter((condition) => condition.targetValue.trim() !== ''),
        actions: rule.actions.filter((action) => action.headerName.trim() !== ''),
      }))
      .filter((rule) => rule.conditions.length > 0 && rule.actions.length > 0);

    dispatch(setHeaderRules(cleanedRules));
    // One session is shared by every preview screen, a reload applies the rules everywhere.
    webViewPubSub.publish(NAVIGATION_EVENTS.RELOAD);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modify Request Headers">
      <div className="flex max-h-[70vh] w-[78vw] max-w-5xl flex-col gap-4 overflow-y-auto">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          A rule applies to a request when all of its enabled conditions match. Rules apply to every
          preview screen.
        </p>

        {rules.map((rule, ruleIndex) => (
          <div
            key={rule.id}
            className="flex flex-col gap-3 rounded-md border border-gray-300 p-3 dark:border-gray-600"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rule {ruleIndex + 1}</span>
              <div className="flex flex-wrap items-center gap-2">
                <Toggle
                  isOn={rule.enabled}
                  onChange={(e) => updateRule(rule.id, {enabled: e.target.checked})}
                />
                <DeleteButton
                  title="Delete rule"
                  onClick={() => setRules(rules.filter((r) => r.id !== rule.id))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                If Request
              </span>
              {rule.conditions.map((condition) => (
                <div key={condition.id} className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Match type"
                    className={`w-28 ${fieldClassName}`}
                    value={condition.matchType}
                    onChange={(e) =>
                      updateCondition(rule, condition.id, {
                        matchType: e.target.value as HeaderRuleCondition['matchType'],
                      })
                    }
                  >
                    {Object.values(MATCH_TYPES).map((matchType) => (
                      <option key={matchType} value={matchType}>
                        {MATCH_TYPE_LABELS[matchType]}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    aria-label="Target value"
                    placeholder="https://preprod.example.com/"
                    className={`min-w-[12rem] flex-grow ${fieldClassName}`}
                    value={condition.targetValue}
                    onChange={(e) =>
                      updateCondition(rule, condition.id, {targetValue: e.target.value})
                    }
                  />
                  <select
                    aria-label="Resource type"
                    className={`w-32 ${fieldClassName}`}
                    value={condition.resourceType}
                    onChange={(e) =>
                      updateCondition(rule, condition.id, {resourceType: e.target.value})
                    }
                  >
                    {RESOURCE_TYPES.map((resourceType) => (
                      <option key={resourceType} value={resourceType}>
                        {resourceType === ANY ? 'Any resource' : resourceType}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Request method"
                    className={`w-28 ${fieldClassName}`}
                    value={condition.requestMethod}
                    onChange={(e) =>
                      updateCondition(rule, condition.id, {requestMethod: e.target.value})
                    }
                  >
                    {REQUEST_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method === ANY ? 'Any method' : method}
                      </option>
                    ))}
                  </select>
                  <Toggle
                    isOn={condition.enabled}
                    onChange={(e) =>
                      updateCondition(rule, condition.id, {enabled: e.target.checked})
                    }
                  />
                  <DeleteButton
                    title="Delete condition"
                    onClick={() =>
                      updateRule(rule.id, {
                        conditions: rule.conditions.filter((c) => c.id !== condition.id),
                      })
                    }
                  />
                </div>
              ))}
              <AddButton
                label="Add Condition"
                onClick={() =>
                  updateRule(rule.id, {conditions: [...rule.conditions, newCondition()]})
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Operator</span>
              {rule.actions.map((action) => (
                <div key={action.id} className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Operation"
                    className={`w-28 capitalize ${fieldClassName}`}
                    value={action.operation}
                    onChange={(e) =>
                      updateAction(rule, action.id, {
                        operation: e.target.value as HeaderRuleAction['operation'],
                      })
                    }
                  >
                    {Object.values(HEADER_OPERATIONS).map((operation) => (
                      <option key={operation} value={operation} className="capitalize">
                        {operation}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Header type"
                    className={`w-28 ${fieldClassName}`}
                    value={action.headerType}
                    onChange={(e) =>
                      updateAction(rule, action.id, {
                        headerType: e.target.value as HeaderRuleAction['headerType'],
                      })
                    }
                  >
                    <option value={HEADER_TYPES.REQUEST}>Request</option>
                    <option value={HEADER_TYPES.RESPONSE}>Response</option>
                  </select>
                  <select
                    aria-label="Standard header names"
                    title="Pick a standard header"
                    className={`w-28 ${fieldClassName}`}
                    value=""
                    onChange={(e) => updateAction(rule, action.id, {headerName: e.target.value})}
                  >
                    <option value="">Standard…</option>
                    {STANDARD_HTTP_HEADERS.map((headerName) => (
                      <option key={headerName} value={headerName}>
                        {headerName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    aria-label="Header name"
                    placeholder="x-custom-header"
                    className={`min-w-[12rem] flex-grow ${fieldClassName}`}
                    value={action.headerName}
                    onChange={(e) => updateAction(rule, action.id, {headerName: e.target.value})}
                  />
                  <input
                    type="text"
                    aria-label="Header value"
                    placeholder={
                      action.operation === HEADER_OPERATIONS.REMOVE ? 'not needed' : 'value'
                    }
                    disabled={action.operation === HEADER_OPERATIONS.REMOVE}
                    className={`min-w-[12rem] flex-grow disabled:opacity-50 ${fieldClassName}`}
                    value={action.headerValue}
                    onChange={(e) => updateAction(rule, action.id, {headerValue: e.target.value})}
                  />
                  <Toggle
                    isOn={action.enabled}
                    onChange={(e) => updateAction(rule, action.id, {enabled: e.target.checked})}
                  />
                  <DeleteButton
                    title="Delete header"
                    onClick={() =>
                      updateRule(rule.id, {
                        actions: rule.actions.filter((a) => a.id !== action.id),
                      })
                    }
                  />
                </div>
              ))}
              <AddButton
                label="Add Header"
                onClick={() => updateRule(rule.id, {actions: [...rule.actions, newAction()]})}
              />
            </div>
          </div>
        ))}

        <AddButton label="Add Rule" onClick={() => setRules([...rules, newRule()])} />

        <div>
          <Button className="px-5 py-1" onClick={onSave} isPrimary isTextButton>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModifyHeadersModal;
