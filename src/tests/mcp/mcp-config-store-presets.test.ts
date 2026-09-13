/**
 * Tests for the MCP server preset catalog in MCPConfigStore.
 */
import { describe, it, expect } from 'vitest';

import { MCP_SERVER_PRESETS, mcpConfigStore } from '../../main/mcp/mcp-config-store';

describe('MCPConfigStore presets', () => {
  it('exposes the built-in presets', () => {
    expect(Object.keys(MCP_SERVER_PRESETS)).toContain('chrome');
    expect(Object.keys(MCP_SERVER_PRESETS)).toContain('notion');
  });

  it('includes a keyless You.com web search preset using the remote streamable-http endpoint', () => {
    const preset = MCP_SERVER_PRESETS['you-search'];
    expect(preset).toBeDefined();
    expect(preset.type).toBe('streamable-http');
    expect(preset.url).toBe('https://api.you.com/mcp?profile=free');
    // No env vars required: the free profile is keyless, so the preset can be
    // added with a single click from the Connectors settings.
    expect(preset.requiresEnv ?? []).toHaveLength(0);
  });

  it('creates a disabled server config from the You.com preset', () => {
    const config = mcpConfigStore.createFromPreset('you-search');
    expect(config).not.toBeNull();
    expect(config?.name).toBe('You');
    expect(config?.type).toBe('streamable-http');
    expect(config?.url).toBe('https://api.you.com/mcp?profile=free');
    // The disabled-by-default opt-in contract lives here: a preset must never
    // produce an enabled server config on its own.
    expect(config?.enabled).toBe(false);
    expect(config?.id).toMatch(/^mcp-you-search-/);
    // Keyless remote preset: no command to run and no env values to fill in,
    // so Quick Add needs nothing from the user beyond the opt-in.
    expect(config?.command).toBeUndefined();
    expect(config?.env ?? {}).toEqual({});
  });

  it('returns null for an unknown preset key', () => {
    expect(mcpConfigStore.createFromPreset('does-not-exist')).toBeNull();
  });
});
