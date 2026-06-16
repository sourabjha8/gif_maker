/**
 * Content validation utilities.
 * Validates tour content JSON at load time.
 *
 * Reference: BUILD_PLAN.md §6 - "The app must not render invalid content
 * silently. At startup or route load, validate content and show a clear
 * developer-facing error in development."
 */

import { VirtualXpContentSchema } from './schemas';
import type { VirtualXpContent } from '../../types';

export { VirtualXpContentSchema } from './schemas';
export * from './schemas';

/**
 * Validate raw content data against the VirtualXpContent schema.
 * Returns the validated content or throws a descriptive error.
 */
export function validateContent(data: unknown): VirtualXpContent {
  const result = VirtualXpContentSchema.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `[Virtual XP] Content validation failed:\n${issues}\n\n` +
      `Fix the content JSON before the app can render.`
    );
  }

  return result.data as VirtualXpContent;
}

/**
 * Safe validation — returns null instead of throwing on invalid content.
 * Useful for optional or partial content loading.
 */
export function validateContentSafe(
  data: unknown
): { content: VirtualXpContent; error: null } | { content: null; error: string } {
  const result = VirtualXpContentSchema.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    return { content: null, error: issues };
  }

  return { content: result.data as VirtualXpContent, error: null };
}
