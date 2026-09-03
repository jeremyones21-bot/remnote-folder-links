/**
 * Client for the local DockLink helper, reused here rather than reinvented.
 *
 * A browser file input can't hand back a real filesystem path (deliberately,
 * for security), so linking a local file that stays where it is needs a
 * native picker outside the browser sandbox - which is exactly what
 * DockLink's helper (`~/Developer/remnote-docklink/helper`) already
 * provides. This plugin just calls the same already-running local server;
 * it needs the same token, pasted into this plugin's own settings.
 */

import type { RNPlugin } from '@remnote/plugin-sdk';
import { DEFAULT_PORT, SETTING_PORT, SETTING_TOKEN } from './constants';

export interface LinkItem {
  id: string;
  path: string;
  name: string;
  kind: 'file' | 'folder';
}

/** Distinguishes "the helper isn't running" from "the helper said no". */
export class HelperOfflineError extends Error {
  constructor(public port: number) {
    super(
      `Can't reach the DockLink helper on port ${port}. ` +
        `Install it from the DockLink plugin (./helper/install.sh), then paste its token into this plugin's settings.`
    );
    this.name = 'HelperOfflineError';
  }
}

export class HelperError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'HelperError';
  }
}

export async function getPort(plugin: RNPlugin): Promise<number> {
  const raw = await plugin.settings.getSetting<number>(SETTING_PORT);
  const port = Number(raw);
  return Number.isFinite(port) && port > 0 && port < 65536 ? port : DEFAULT_PORT;
}

export async function getToken(plugin: RNPlugin): Promise<string> {
  return ((await plugin.settings.getSetting<string>(SETTING_TOKEN)) || '').trim();
}

export const baseUrl = (port: number) => `http://127.0.0.1:${port}`;

async function request<T>(port: number, route: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl(port)}${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new HelperOfflineError(port);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new HelperError((payload as any)?.error || `Helper returned ${response.status}`, response.status);
  }
  return payload as T;
}

/** `{ cancelled: true }` when the user dismissed the dialog - not an error. */
export async function pick(
  plugin: RNPlugin,
  options: { kind?: 'file' | 'folder' | 'any'; multiple?: boolean; prompt?: string } = {}
): Promise<{ items?: LinkItem[]; cancelled?: boolean }> {
  const port = await getPort(plugin);
  const token = await getToken(plugin);
  if (!token) {
    throw new HelperError(
      'No helper token set. Install DockLink\'s helper (./helper/install.sh) and paste its token into this plugin\'s settings.',
      401
    );
  }
  return request(port, '/pick', { token, ...options });
}

/** The clickable URL for a picked item, via the helper's own /open route. */
export function clickUrl(item: LinkItem, port: number): string {
  return `${baseUrl(port)}/open?id=${encodeURIComponent(item.id)}`;
}

export const describeError = (e: unknown): string =>
  e instanceof Error ? e.message : typeof e === 'string' ? e : JSON.stringify(e);
