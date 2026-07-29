import {Icon} from '@iconify/react';
import cx from 'classnames';
import {IPC_MAIN_CHANNELS} from 'common/constants';
import {useCallback, useEffect, useState} from 'react';
import Popover from 'renderer/components/Popover';

interface McpServerStatus {
  enabled: boolean;
  running: boolean;
  port: number;
  endpoint: string;
  error: string | null;
}

const configSnippet = (): string =>
  JSON.stringify(
    {mcpServers: {responsively: {command: 'npx', args: ['-y', '@responsively/mcp']}}},
    null,
    2
  );

/**
 * MCP server panel: status, an on/off switch that persists, and the config
 * snippet for wiring an AI agent up by hand.
 */
const McpPanel = () => {
  const [status, setStatus] = useState<McpServerStatus | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    const next = await window.electron.ipcRenderer.invoke<unknown, McpServerStatus>(
      IPC_MAIN_CHANNELS.MCP_STATUS
    );
    setStatus(next);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async () => {
    if (status === null) {
      return;
    }
    const next = await window.electron.ipcRenderer.invoke<{enabled: boolean}, McpServerStatus>(
      IPC_MAIN_CHANNELS.MCP_SET_ENABLED,
      {enabled: !status.enabled}
    );
    setStatus(next);
  };

  const copyConfig = async () => {
    await window.electron.ipcRenderer.invoke(IPC_MAIN_CHANNELS.COPY_TO_CLIPBOARD, configSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRunning = status?.running ?? false;
  const statusLabel = (() => {
    if (status === null) return 'checking…';
    if (status.running) return 'running';
    if (!status.enabled) return 'off';
    return status.error ?? 'stopped';
  })();

  return (
    <Popover
      triggerTitle="MCP server — connect AI tools"
      anchor="bottom end"
      triggerClassName="flex h-[34px] items-center gap-[7px] rounded-[9px] border border-line px-3 text-[12.5px] font-bold text-fg transition-colors hover:bg-hover"
      className="w-[302px] p-[6px]"
      trigger={
        <span className="pointer-events-none contents">
          <Icon icon="lucide:plug-zap" fontSize={16} className="text-accent" />
          MCP
        </span>
      }
    >
      <div data-testid="mcp-panel">
        <div className="flex items-center gap-2 px-[10px] pb-[2px] pt-[10px]">
          <span className="text-[13px] font-bold">MCP server</span>
          <span
            data-testid="mcp-status"
            className={cx(
              'flex items-center gap-[5px] font-mono text-[11px]',
              isRunning ? 'text-accent' : 'text-muted'
            )}
          >
            <span
              className={cx('h-[6px] w-[6px] rounded-full', isRunning ? 'bg-accent' : 'bg-muted')}
            />
            {statusLabel}
          </span>
          <span className="flex-1" />
          <button
            type="button"
            title="Start / stop MCP server"
            aria-label="MCP server"
            aria-pressed={status?.enabled ?? false}
            onClick={toggle}
            className="relative inline-flex items-center focus:outline-none"
          >
            <span
              className={cx(
                'block h-[18px] w-8 rounded-full transition-colors',
                status?.enabled ? 'bg-accent' : 'bg-line'
              )}
            />
            <span
              className={cx(
                'absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-[left]',
                status?.enabled ? 'left-4' : 'left-[2px]'
              )}
            />
          </button>
        </div>

        <div className="px-[10px] pb-[10px] pt-1 text-[11.5px] leading-[1.55] text-muted">
          Let AI agents drive this device lab — open URLs, screenshot devices, inspect responsive
          layouts.
        </div>

        <div className="mx-1 mb-[6px] border-t border-line-soft" />

        <button
          type="button"
          onClick={copyConfig}
          className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-2 text-[13px] text-fg hover:bg-hover focus:outline-none"
        >
          <span className="pointer-events-none contents">
            <Icon icon="lucide:copy" fontSize={14} className="text-muted" />
            {copied ? 'Copied!' : 'Copy config'}
            <span className="ml-auto font-mono text-[10.5px] text-muted">any MCP client</span>
          </span>
        </button>

        <div className="px-[10px] pb-2 font-mono text-[10.5px] text-muted">
          {status?.endpoint ?? ''}
        </div>
      </div>
    </Popover>
  );
};

export default McpPanel;
