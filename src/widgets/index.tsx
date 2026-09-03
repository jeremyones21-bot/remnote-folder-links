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

  // Confirmed live: registering both DocumentAboveToolbar and
  // DocumentBelowToolbar only ever mounted one widget instance (one
  // widgetInstanceId in the diag log), and the button landed above the
  // breadcrumb - i.e. DocumentAboveToolbar won and BelowToolbar never
  // rendered. Isolating to BelowToolbar alone to see whether it renders on
  // its own (closer to the "Create Notes" row) once it isn't competing with
  // the other registration for the same slot.
  try {
    await plugin.app.registerWidget(ADD_LINK_BUTTON_WIDGET, WidgetLocation.DocumentBelowToolbar, {
      dimensions: { height: 'auto', width: 'auto' },
    });
  } catch (e) {
    await diag(plugin, 'registerWidget DocumentBelowToolbar failed', { error: describeError(e) });
  }

  await diag(plugin, 'onActivate complete');
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
