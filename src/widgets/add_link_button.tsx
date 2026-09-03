import { renderWidget, usePlugin, useRunAsync } from '@remnote/plugin-sdk';
import { useEffect } from 'react';
import { ADD_LINK_DIALOG_WIDGET, ADD_LINK_SESSION_KEY, AddLinkTarget } from '../constants';
import { describeError, diag } from '../diag';

/** The same button, registered at two candidate locations from index.tsx. */
export const AddLinkButton = () => {
  const plugin = usePlugin();

  // Proof of which location actually mounted this instance, and with what
  // documentId - registering a widget at a location doesn't mean RemNote
  // renders it there (see the flashcard exporter's QueueToolbar saga).
  const context = useRunAsync(() => plugin.widget.getWidgetContext(), []);
  useEffect(() => {
    diag(plugin, 'add_link_button mounted', context);
  }, [context]);

  const open = async () => {
    try {
      const documentId = (context as { documentId?: string } | undefined)?.documentId;
      if (!documentId) {
        await plugin.app.toast("Folder Links: couldn't tell which folder this is.");
        return;
      }
      await plugin.storage.setSession(ADD_LINK_SESSION_KEY, { documentId } satisfies AddLinkTarget);
      await plugin.window.openFloatingWidget(ADD_LINK_DIALOG_WIDGET, { top: 100, left: 100 });
    } catch (e) {
      await diag(plugin, 'add_link_button open failed', { error: describeError(e) });
    }
  };

  return (
    <button
      onClick={open}
      title="Add a link to this folder"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 14,
        fontWeight: 500,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '8px 14px',
        borderRadius: 8,
        border: '1px solid rgba(0,0,0,0.15)',
        background: '#fff',
        color: '#111',
        cursor: 'pointer',
      }}
    >
      <span aria-hidden>🔗</span>
      Add Link
    </button>
  );
};

renderWidget(AddLinkButton);
