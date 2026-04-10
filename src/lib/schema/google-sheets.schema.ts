import { z } from 'zod';

// Defines the row structure for "Generations" Tab
export const GoogleSheetRowSchema = z.tuple([
  z.string(), // Timestamp (ISO)
  z.string(), // Format
  z.string(), // Input combination summary
  z.string(), // Finished Post Body
  z.string(), // Hashtags (comma separated)
]);

export type GoogleSheetRow = z.infer<typeof GoogleSheetRowSchema>;
