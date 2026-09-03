/**
 * Building a clickable RemNote hyperlink.
 *
 * The URL goes in `iUrl`. That field appears nowhere in the plugin SDK - not
 * in `RichTextElementTextInterface`, not in `RICH_TEXT_FORMATTING` - and the
 * two fields the SDK does offer are both wrong: `url` (`DEPRECATED_LINK`) is
 * stored happily by `setText` and then ignored by the renderer, and `qId`
 * (named `INLINE_LINK`, misleadingly) is not a URL field at all. This was
 * worked out for DockLink by reading the markup RemNote itself produces for
 * a link made via Cmd+K's link command, and applies equally to a plain web
 * URL - RemNote doesn't distinguish by scheme. If links ever stop rendering
 * after a RemNote update, do that again rather than trusting the SDK's type.
 */

import type { RichTextInterface } from '@remnote/plugin-sdk';

export function linkRichText(label: string, url: string): RichTextInterface {
  return [{ i: 'm', text: label, iUrl: url } as unknown as RichTextInterface[number]];
}

/** `https://www.example.com/some/long/path` -> `example.com` */
export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Adds `https://` when a URL is typed without a scheme, e.g. "example.com". */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
