import DOMPurify from "isomorphic-dompurify";

// SERVER-ONLY: import this from server components / route handlers only.
// Importing it from a "use client" file would pull DOMPurify back into the
// client bundle — sanitize at the data-fetch layer and pass clean strings down.
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}
