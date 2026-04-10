import { z } from 'zod';

// Input required from Anteres AI User (Rahul)
export const ContentRequestSchema = z.object({
  rawThoughts: z.string().optional(),
  newsSignals: z.array(z.string()).optional(),
  domainContext: z.string().optional(),
}).refine(data => data.rawThoughts || (data.newsSignals && data.newsSignals.length > 0) || data.domainContext, {
  message: "At least one input (raw thoughts, news signals, or domain context) must be provided.",
});

export type ContentRequest = z.infer<typeof ContentRequestSchema>;

export const PostFormatSchema = z.enum([
  'Founder Reality',
  'Industry Tension',
  'Builder\'s Breakdown',
  'Contrarian Signal',
  'The Long Game'
]);

export type PostFormat = z.infer<typeof PostFormatSchema>;

// Output Generated Post matching prompt strictness
export const GeneratedPostSchema = z.object({
  format: PostFormatSchema,
  body: z.string().min(10, 'Body too short to be a valid post.'),
  hashtags: z.array(z.string()).max(5, 'Maximum 5 hashtags allowed.'),
  editorsNote: z.string(),
});

export type GeneratedPost = z.infer<typeof GeneratedPostSchema>;

// The final batch of 5
export const GenerationBatchSchema = z.array(GeneratedPostSchema).length(5, 'Batch must contain exactly 5 posts');

export type GenerationBatch = z.infer<typeof GenerationBatchSchema>;
