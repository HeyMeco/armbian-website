import sanitizeHtml from 'sanitize-html';

interface SanitizeOptions {
  /** Open absolute http(s) links in a new tab with a safe `rel`. */
  externalLinksInNewTab?: boolean;
}

export function sanitizeCmsHtml(html: string, options: SanitizeOptions = {}): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'pre',
      'code',
      'span',
      'div',
      'figure',
      'figcaption',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      code: ['class'],
      pre: ['class'],
      span: ['class'],
      div: ['class'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['https', 'mailto'],
    transformTags: options.externalLinksInNewTab
      ? {
          a: (tagName, attribs) =>
            /^https?:\/\//i.test(attribs['href'] ?? '')
              ? {
                  tagName,
                  attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' },
                }
              : { tagName, attribs },
        }
      : undefined,
  });
}
