import type { RNPlugin } from '@remnote/plugin-sdk';

/**
 * Dev-only: ship real data to the dev-server log. The plugin runs in a
 * sandboxed iframe inside RemNote with no reachable console, and toasts
 * truncate JSON, so this is the only way to see what RemNote actually did.
 * No-ops for an installed build, which isn't served from localhost.
 */
export const diag = async (plugin: RNPlugin, label: string, data?: unknown) => {
  try {
    const root = (plugin as any).rootURL as string | undefined;
    if (!root || !root.includes('localhost')) return;
    await fetch(root.replace(/\/$/, '') + '/__diag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, data }, null, 2),
    });
  } catch {
    /* diagnostics must never break the feature */
  }
};

export const describeError = (e: unknown) =>
  e instanceof Error ? e.message : typeof e === 'string' ? e : JSON.stringify(e);
