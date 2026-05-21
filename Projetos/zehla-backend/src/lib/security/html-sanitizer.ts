import DOMPurify from 'isomorphic-dompurify';

/**
 * ZEHLA HTML Sanitizer — Powered by DOMPurify
 * Prevents XSS by stripping dangerous tags and attributes from user-generated HTML.
 *
 * https://github.com/cure53/DOMPurify
 */

const ALLOWED_TAGS = [
  'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
  'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'img', 'blockquote', 'code', 'pre', 'hr', 'small', 'sub', 'sup',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'alt', 'title', 'src', 'class'];

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
