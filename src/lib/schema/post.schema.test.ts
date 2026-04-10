import { describe, it, expect } from 'vitest';
import { ContentRequestSchema, GeneratedPostSchema } from './post.schema';

describe('Post Schema Validation', () => {
  it('should invalidate an empty content request', () => {
    const result = ContentRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should validate a valid content request', () => {
    const result = ContentRequestSchema.safeParse({
      rawThoughts: 'Building AI tools is hard.'
    });
    expect(result.success).toBe(true);
  });

  it('should invalidate a post with generic format', () => {
    const result = GeneratedPostSchema.safeParse({
      format: 'Generic Marketing' as any,
      body: 'This is my post.',
      hashtags: ['#ai'],
      editorsNote: 'Test'
    });
    expect(result.success).toBe(false);
  });

  it('should validate a correct generated post', () => {
    const result = GeneratedPostSchema.safeParse({
      format: 'Founder Reality',
      body: 'Today I observed the hidden costs of AI.',
      hashtags: ['#AI', '#Founders'],
      editorsNote: 'Focused on hidden costs.'
    });
    expect(result.success).toBe(true);
  });
});
