# Folder Links

Add a link directly as an item inside a folder, from the folder's own page —
next to "Create Notes" and "Upload PDF" — instead of opening a note first.
Supports two kinds of link:

- **Web links** — paste a URL, optionally give it a label (defaults to the
  domain), and it's added as a clickable child item.
- **Local files/folders** — pick a file or folder on this Mac via a native
  dialog, and it's added as a link that opens the file in place, without
  uploading it. This reuses the [DockLink](../remnote-docklink) plugin's
  already-running local helper rather than reimplementing a native file
  picker — see `src/helper_client.ts`. You'll need DockLink's helper
  installed and its token pasted into this plugin's own settings (Settings →
  Plugins → Folder Links) for the local-file half to work; web links need
  none of that.

## Using it

Open a folder's page and click **🔗 Add Link** in its toolbar.

## Development

```bash
npm install
npm run dev      # dev server on :8081 - add it in RemNote's plugin settings
npm run build    # type-checks, validates the manifest, zips dist/
```

`WidgetLocation.DocumentBelowToolbar` and `DocumentAboveToolbar` are both
registered for the button; which one (if either) RemNote actually renders on
a given version needs testing live inside RemNote — a dev-only diagnostics
channel (`/__diag` in `webpack.config.js`) pings a local log on mount so this
doesn't have to be guessed blind. See the flashcard-exporter plugin's history
for why that matters: several plausible `WidgetLocation` values register
without error but never render anything.
