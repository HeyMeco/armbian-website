import { Marked } from 'marked';
import { ARMBIAN_URLS } from '@armbian/config';
import { sanitizeCmsHtml } from './sanitize';

const FETCH_TIMEOUT_MS = 5_000;
/** Instructions change rarely; let Next's data cache serve them for an hour. */
const REVALIDATE_SECONDS = 3_600;
const ALLOWED_ORIGIN = new URL(ARMBIAN_URLS.CDN).origin;

const marked = new Marked({ gfm: true, async: false });

/**
 * Fetch a board's Markdown install instructions (published from
 * armbian/armbian.github.io/board-instructions) and render them to sanitized
 * HTML. Returns null when the URL is missing, off the Armbian CDN, or the
 * fetch fails, so the board page simply omits the section.
 */
export async function loadBoardInstructions(
  url: string | null | undefined,
): Promise<string | null> {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  // The URL comes from upstream data; only fetch from our own CDN.
  if (parsed.origin !== ALLOWED_ORIGIN) return null;

  try {
    const res = await fetch(parsed, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const markdown = await res.text();
    if (!markdown.trim()) return null;
    const html = sanitizeCmsHtml(marked.parse(markdown) as string, { externalLinksInNewTab: true });
    return html.trim() ? html : null;
  } catch {
    return null;
  }
}
