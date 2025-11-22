/**
 * Optimizes HTML content by removing unnecessary elements to reduce token usage for AI context.
 * Removes:
 * - <script> tags and content
 * - <style> tags and content
 * - <svg> tags and content
 * - HTML comments
 * - Empty lines and excessive whitespace
 */
export const optimizeHtml = (html: string): string => {
  if (!html) return '';

  let optimized = html;

  // Remove scripts
  optimized = optimized.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '');

  // Remove styles
  optimized = optimized.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, '');

  // Remove SVGs (often very large and not semantically important for text analysis)
  optimized = optimized.replace(/<svg\b[^>]*>([\s\S]*?)<\/svg>/gim, '');

  // Remove HTML comments
  optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');

  // Collapse whitespace and remove empty lines
  optimized = optimized
    .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
    .replace(/\s+/g, ' '); // Collapse multiple spaces

  return optimized.trim();
};
