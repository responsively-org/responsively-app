import fs from 'fs';
import os from 'os';
import path from 'path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {AgentEnv, listAgentTools, setToolEntry} from './agent-config';

let homeDir: string;
const env = (): AgentEnv => ({homeDir, platform: 'darwin'});

const cursorConfig = () => path.join(homeDir, '.cursor', 'mcp.json');
const codexConfig = () => path.join(homeDir, '.codex', 'config.toml');
const vscodeConfig = () =>
  path.join(homeDir, 'Library', 'Application Support', 'Code', 'User', 'mcp.json');

const write = (file: string, contents: string) => {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, contents, 'utf-8');
};

beforeEach(() => {
  homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-config-'));
});

afterEach(() => {
  fs.rmSync(homeDir, {recursive: true, force: true});
});

describe('listAgentTools', () => {
  it('reports tools as not installed when nothing is on disk', () => {
    const tools = listAgentTools(env());
    expect(tools).toHaveLength(5);
    expect(tools.every((t) => !t.installed)).toBe(true);
    expect(tools.every((t) => !t.added)).toBe(true);
  });

  it('detects an installed tool by its config directory', () => {
    fs.mkdirSync(path.join(homeDir, '.cursor'), {recursive: true});
    const cursor = listAgentTools(env()).find((t) => t.id === 'cursor');
    expect(cursor?.installed).toBe(true);
    expect(cursor?.added).toBe(false);
  });
});

describe('setToolEntry (JSON tools)', () => {
  it('adds the server without disturbing existing config', () => {
    write(
      cursorConfig(),
      JSON.stringify({mcpServers: {other: {command: 'foo'}}, somethingElse: 42}, null, 2)
    );

    setToolEntry(env(), 'cursor', true);

    const config = JSON.parse(fs.readFileSync(cursorConfig(), 'utf-8'));
    expect(config.mcpServers.responsively).toEqual({
      command: 'npx',
      args: ['-y', '@responsively/mcp'],
    });
    // Untouched neighbours.
    expect(config.mcpServers.other).toEqual({command: 'foo'});
    expect(config.somethingElse).toBe(42);
  });

  it('creates the file when it does not exist yet', () => {
    setToolEntry(env(), 'cursor', true);
    const config = JSON.parse(fs.readFileSync(cursorConfig(), 'utf-8'));
    expect(config.mcpServers.responsively).toBeDefined();
  });

  it('removes only our entry', () => {
    write(cursorConfig(), JSON.stringify({mcpServers: {other: {command: 'foo'}}}, null, 2));
    setToolEntry(env(), 'cursor', true);
    setToolEntry(env(), 'cursor', false);

    const config = JSON.parse(fs.readFileSync(cursorConfig(), 'utf-8'));
    expect(config.mcpServers.responsively).toBeUndefined();
    expect(config.mcpServers.other).toEqual({command: 'foo'});
  });

  it('refuses to touch a malformed config', () => {
    write(cursorConfig(), '{ this is not json');
    const result = setToolEntry(env(), 'cursor', true);
    expect(result).toHaveProperty('error');
    expect(fs.readFileSync(cursorConfig(), 'utf-8')).toBe('{ this is not json');
  });

  it('uses the servers key for VS Code', () => {
    setToolEntry(env(), 'vscode', true);
    const config = JSON.parse(fs.readFileSync(vscodeConfig(), 'utf-8'));
    expect(config.servers.responsively).toBeDefined();
    expect(config.mcpServers).toBeUndefined();
  });

  it('is idempotent', () => {
    setToolEntry(env(), 'cursor', true);
    setToolEntry(env(), 'cursor', true);
    const config = JSON.parse(fs.readFileSync(cursorConfig(), 'utf-8'));
    expect(Object.keys(config.mcpServers)).toEqual(['responsively']);
  });
});

describe('setToolEntry (Codex TOML)', () => {
  it('appends a section and keeps existing content', () => {
    write(codexConfig(), 'model = "o3"\n\n[mcp_servers.other]\ncommand = "foo"\n');

    setToolEntry(env(), 'codex', true);

    const raw = fs.readFileSync(codexConfig(), 'utf-8');
    expect(raw).toContain('model = "o3"');
    expect(raw).toContain('[mcp_servers.other]');
    expect(raw).toContain('[mcp_servers.responsively]');
    expect(raw).toContain('command = "npx"');
    expect(raw).toContain('args = ["-y", "@responsively/mcp"]');
  });

  it('does not duplicate the section', () => {
    setToolEntry(env(), 'codex', true);
    setToolEntry(env(), 'codex', true);
    const raw = fs.readFileSync(codexConfig(), 'utf-8');
    expect(raw.match(/\[mcp_servers\.responsively\]/g)).toHaveLength(1);
  });

  it('removes only our section', () => {
    write(codexConfig(), 'model = "o3"\n\n[mcp_servers.other]\ncommand = "foo"\n');
    setToolEntry(env(), 'codex', true);
    setToolEntry(env(), 'codex', false);

    const raw = fs.readFileSync(codexConfig(), 'utf-8');
    expect(raw).not.toContain('responsively');
    expect(raw).toContain('model = "o3"');
    expect(raw).toContain('[mcp_servers.other]');
    expect(raw).toContain('command = "foo"');
  });

  it('round-trips through the reported state', () => {
    setToolEntry(env(), 'codex', true);
    expect(listAgentTools(env()).find((t) => t.id === 'codex')?.added).toBe(true);
    setToolEntry(env(), 'codex', false);
    expect(listAgentTools(env()).find((t) => t.id === 'codex')?.added).toBe(false);
  });
});
