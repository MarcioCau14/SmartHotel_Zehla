/**
 * ZEHLA HTML Sanitizer
 * Prevents XSS by stripping dangerous tags and attributes from user-generated HTML.
 *
 * NOTE: For production, install `isomorphic-dompurify` and replace this with DOMPurify.sanitize()
 * npm install isomorphic-dompurify
 */

const ALLOWED_TAGS = new Set([
  'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
  'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'img', 'blockquote', 'code', 'pre', 'hr', 'small', 'sub', 'sup',
]);

const ALLOWED_ATTRS = new Set(['href', 'target', 'rel', 'alt', 'title', 'src', 'class']);

const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'mhtml:'];

function stripTags(html: string, allowed: Set<string>): string {
  return html.replace(/<([/]?)(\w+)([^>]*)>/g, (_match, slash, tag, attrs) => {
    const tagName = tag.toLowerCase();
    if (!allowed.has(tagName)) return '';
    return `<${slash}${tagName}${attrs}>`;
  });
}

function stripDangerousAttrs(html: string, allowed: Set<string>): string {
  return html.replace(/<(\w+)([^>]*)>/g, (_match, tag, attrs) => {
    const safeAttrs = attrs.replace(/(\w+)\s*=\s*["']?([^"'\s>]+)["']?/gi, (attrMatch, name, value) => {
      const attrName = name.toLowerCase();
      if (!allowed.has(attrName)) return '';
      if (attrName === 'href' || attrName === 'src') {
        const lowerValue = value.toLowerCase();
        if (DANGEROUS_PROTOCOLS.some(p => lowerValue.startsWith(p))) return '';
      }
      if (attrName.startsWith('on')) return '';
      return attrMatch;
    });
    return `<${tag}${safeAttrs}>`;
  });
}

function stripEventHandlers(html: string): string {
  return html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
             .replace(/\s*on\w+\s*=\s*\S+/gi, '');
}

function stripScriptContent(html: string): string {
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
             .replace(/<script[^>]*\/?>/gi, '');
}

function stripStyleExpressions(html: string): string {
  return html.replace(/style\s*=\s*["'][^"']*expression[^"']*["']/gi, '')
             .replace(/style\s*=\s*["'][^"']*javascript:[^"']*["']/gi, '');
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  let result = stripScriptContent(html);
  result = stripEventHandlers(result);
  result = stripStyleExpressions(result);
  result = stripTags(result, ALLOWED_TAGS);
  result = stripDangerousAttrs(result, ALLOWED_ATTRS);

  return result;
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
