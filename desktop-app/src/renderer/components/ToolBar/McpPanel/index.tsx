import {Icon} from '@iconify/react';
import cx from 'classnames';
import {IPC_MAIN_CHANNELS} from 'common/constants';
import {useCallback, useEffect, useState} from 'react';
import Popover from 'renderer/components/Popover';

interface AgentToolState {
  id: string;
  name: string;
  icon: string;
  color: string;
  installed: boolean;
  added: boolean;
  configPath: string | null;
}

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
  const [tools, setTools] = useState<AgentToolState[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [toolError, setToolError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const next = await window.electron.ipcRenderer.invoke<unknown, McpServerStatus>(
      IPC_MAIN_CHANNELS.MCP_STATUS
    );
    setStatus(next);
    const nextTools = await window.electron.ipcRenderer.invoke<unknown, AgentToolState[]>(
      IPC_MAIN_CHANNELS.MCP_LIST_TOOLS
    );
    setTools(nextTools);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setTool = async (toolId: string, add: boolean) => {
    setToolError(null);
    const response = await window.electron.ipcRenderer.invoke<
      {toolId: string; add: boolean},
      {tools: AgentToolState[]; result: {error?: string}}
    >(IPC_MAIN_CHANNELS.MCP_SET_TOOL, {toolId, add});
    setTools(response.tools);
    if (response.result?.error != null) {
      setToolError(response.result.error);
    }
  };

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
        <div className="flex items-center gap-2 px-[10px] pt-[10px] pb-[2px]">
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

        <div className="px-[10px] pt-1 pb-[10px] text-[11.5px] leading-[1.55] text-muted">
          Let AI agents drive this device lab — open URLs, screenshot devices, inspect responsive
          layouts.
        </div>

        <div className="mx-1 mb-[6px] border-t border-line-soft" />

        <div className="px-[10px] pt-[2px] pb-1 text-[10.5px] font-bold tracking-[0.08em] text-muted">
          ADD TO YOUR TOOLS
        </div>
        <div className={cx({'pointer-events-none opacity-40': !(status?.enabled ?? false)})}>
          {tools.filter((tool) => tool.installed).length === 0 ? (
            <div className="px-[10px] pb-2 text-[11.5px] text-muted">
              No supported AI tools detected — copy the config below instead.
            </div>
          ) : null}
          {tools
            .filter((tool) => tool.installed)
            .map((tool) => (
              <div
                key={tool.id}
                data-testid={`mcp-tool-${tool.id}`}
                className="flex items-center gap-[9px] rounded-lg px-[10px] py-[5px] hover:bg-hover"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white"
                  style={{background: tool.color}}
                >
                  <Icon icon={tool.icon} fontSize={13} />
                </span>
                <span className="text-[13px]">{tool.name}</span>
                <span className="flex-1" />
                <button
                  type="button"
                  aria-pressed={tool.added}
                  title={
                    tool.added
                      ? `Added — click to remove from ${tool.name}`
                      : `Add Responsively MCP to ${tool.name}`
                  }
                  onClick={() => setTool(tool.id, !tool.added)}
                  className={cx(
                    'h-6 rounded-full text-[11px] font-bold focus:outline-none',
                    tool.added
                      ? 'flex items-center gap-1 px-2 text-accent'
                      : 'border border-accent px-3 text-accent hover:bg-accent-soft'
                  )}
                >
                  <span className="pointer-events-none contents">
                    {tool.added ? <Icon icon="ic:round-check" fontSize={13} /> : null}
                    {tool.added ? 'Added' : 'Add'}
                  </span>
                </button>
              </div>
            ))}
        </div>
        {toolError != null ? (
          <p role="alert" className="px-[10px] py-1 text-[11.5px] text-red-500">
            {toolError}
          </p>
        ) : null}

        <div className="mx-1 my-[6px] border-t border-line-soft" />

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
