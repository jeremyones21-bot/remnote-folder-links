import { declareIndexPlugin, type ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import { ADD_LINK_BUTTON_WIDGET, ADD_LINK_DIALOG_WIDGET, DEFAULT_PORT, SETTING_PORT, SETTING_TOKEN } from '../constants';
import { describeError, diag } from '../diag';

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.settings.registerNumberSetting({
    id: SETTING_PORT,
    title: 'DockLink helper port',
    description: 'The port DockLink\'s ./helper/install.sh reported. Only needed for linking local files/folders.',
    defaultValue: DEFAULT_PORT,
  });

  await plugin.settings.registerStringSetting({
    id: SETTING_TOKEN,
    title: 'DockLink helper token',
    description:
      'The same token DockLink uses, printed by its ./helper/install.sh and stored at ~/.docklink/token. Only needed for linking local files/folders - web links work without it.',
    defaultValue: '',
  });

  await plugin.app.registerWidget(ADD_LINK_DIALOG_WIDGET, WidgetLocation.FloatingWidget, {
    dimensions: { height: 560, width: 480 },
    widgetTabTitle: 'Add Link',
  });

  // Two candidate placements on the folder's own document toolbar - both
  // take {documentId}, so both are cheap to try. Confirmed live which one
  // (if either) actually renders via the mount diag ping in
  // add_link_button.tsx, rather than assuming.
  for (const location of [WidgetLocation.DocumentBelowToolbar, WidgetLocation.DocumentAboveToolbar]) {
    try {
      await plugin.app.registerWidget(ADD_LINK_BUTTON_WIDGET, location, {
        dimensions: { height: 'auto', width: 'auto' },
      });
    } catch (e) {
      await diag(plugin, `registerWidget ${location} failed`, { error: describeError(e) });
    }
  }

  await diag(plugin, 'onActivate complete');
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
