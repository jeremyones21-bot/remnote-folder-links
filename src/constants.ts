/**
 * Shared identifiers. Kept out of `src/widgets/` so importing them doesn't pull
 * `declareIndexPlugin` into the other widget bundles.
 */

export const ADD_LINK_BUTTON_WIDGET = 'add_link_button';
export const ADD_LINK_DIALOG_WIDGET = 'add_link_dialog';

// Local-file linking reuses the DockLink helper (same install, same token) -
// see helper_client.ts. Nothing here talks to the filesystem directly.
export const SETTING_PORT = 'helper-port';
export const SETTING_TOKEN = 'helper-token';
export const DEFAULT_PORT = 4197;

/**
 * Key for `plugin.storage.setSession` / `getSession`, used to hand the
 * folder's documentId to the Add Link dialog. `openFloatingWidget` takes no
 * contextData parameter, so session storage (ephemeral, this-session-only -
 * exactly what a one-shot handoff needs) is the bridge between them.
 */
export const ADD_LINK_SESSION_KEY = 'add-link-target';

export interface AddLinkTarget {
  documentId: string;
}
