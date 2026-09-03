import { renderWidget, usePlugin } from '@remnote/plugin-sdk';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { ADD_LINK_SESSION_KEY, AddLinkTarget } from '../constants';
import { describeError as describe, diag } from '../diag';
import { HelperError, HelperOfflineError, clickUrl, getPort, pick } from '../helper_client';
import { hostnameOf, linkRichText, normalizeUrl } from '../link_text';

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const inputStyle: CSSProperties = {
  fontFamily: FONT,
  fontSize: 14,
  padding: '9px 11px',
  borderRadius: 8,
  border: '1px solid rgba(0,0,0,0.2)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  color: '#111',
  background: '#fff',
};

const buttonStyle = (primary: boolean, disabled: boolean): CSSProperties => ({
  fontFamily: FONT,
  fontSize: 14,
  fontWeight: 600,
  padding: '9px 16px',
  borderRadius: 8,
  border: primary ? 'none' : '1px solid rgba(0,0,0,0.2)',
  background: disabled ? '#eee' : primary ? '#111' : '#fff',
  color: disabled ? '#999' : primary ? '#fff' : '#111',
  cursor: disabled ? 'default' : 'pointer',
  width: '100%',
});

export const AddLinkDialog = () => {
  const plugin = usePlugin();
  const [documentId, setDocumentId] = useState<string | undefined>(undefined);
  const [folderName, setFolderName] = useState<string | undefined>(undefined);
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const target = await plugin.storage.getSession<AddLinkTarget>(ADD_LINK_SESSION_KEY);
      setDocumentId(target?.documentId);
      if (target?.documentId) {
        const rem = await plugin.rem.findOne(target.documentId);
        const name = rem?.text ? (await plugin.richText.toString(rem.text)).trim() : undefined;
        setFolderName(name || undefined);
      }
      await diag(plugin, 'add_link_dialog opened', { documentId: target?.documentId });
    })();
  }, []);

  const addChildRem = async (linkLabel: string, linkUrl: string) => {
    if (!documentId) throw new Error("Don't know which folder to add this to - try reopening it from the folder's Add Link button.");
    const parent = await plugin.rem.findOne(documentId);
    if (!parent) throw new Error('This folder no longer exists.');
    const rem = await plugin.rem.createRem();
    if (!rem) throw new Error('Could not create a new Rem.');
    const siblings = await parent.getChildrenRem();
    await rem.setParent(parent, siblings.length);
    await rem.setText(linkRichText(linkLabel, linkUrl));
  };

  const handleAddWebLink = async () => {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setStatus('Enter a URL first.');
      return;
    }
    setBusy(true);
    try {
      await addChildRem(label.trim() || hostnameOf(normalized), normalized);
      setStatus(`Added a link to ${hostnameOf(normalized)}.`);
      setUrl('');
      setLabel('');
    } catch (e) {
      await diag(plugin, 'add web link failed', { error: describe(e) });
      setStatus('Could not add that link: ' + describe(e));
    } finally {
      setBusy(false);
    }
  };

  const handlePickLocal = async () => {
    setBusy(true);
    setStatus('');
    try {
      const result = await pick(plugin, { kind: 'any', multiple: false, prompt: 'Choose a file or folder to link' });
      if (result.cancelled || !result.items?.length) {
        setBusy(false);
        return;
      }
      const item = result.items[0];
      const port = await getPort(plugin);
      await addChildRem(item.name, clickUrl(item, port));
      setStatus(`Added a link to ${item.name}.`);
    } catch (e) {
      await diag(plugin, 'add local link failed', { error: describe(e) });
      setStatus(
        e instanceof HelperOfflineError || e instanceof HelperError
          ? describe(e)
          : 'Could not add that link: ' + describe(e)
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: FONT,
        background: '#fff',
        color: '#111',
        height: '100%',
        boxSizing: 'border-box',
        padding: 26,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: '#666' }}>
          Add Link
        </div>
        {folderName && <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>To folder: {folderName}</div>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Web link</div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com/article"
          style={inputStyle}
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional — defaults to the domain)"
          style={inputStyle}
        />
        <button onClick={handleAddWebLink} disabled={busy || !url.trim()} style={buttonStyle(true, busy || !url.trim())}>
          Add Web Link
        </button>
      </div>

      <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Local file or folder</div>
        <div style={{ fontSize: 12, color: '#999' }}>
          Links a file on this Mac without uploading it, via DockLink's helper.
        </div>
        <button onClick={handlePickLocal} disabled={busy} style={buttonStyle(false, busy)}>
          Choose File or Folder…
        </button>
      </div>

      <div style={{ fontSize: 13, color: '#666', minHeight: 18 }}>{status}</div>
    </div>
  );
};

renderWidget(AddLinkDialog);
