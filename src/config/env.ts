import { z } from 'zod';

const envSchema = z.object({
  HF_TOKEN: z.string().min(1, 'HF_TOKEN is required').optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().min(1, 'GOOGLE_SERVICE_ACCOUNT_EMAIL is required').optional(),
  GOOGLE_PRIVATE_KEY: z.string().min(1, 'GOOGLE_PRIVATE_KEY is required').optional(),
  GOOGLE_SPREADSHEETS_ID: z.string().min(1, 'GOOGLE_SPREADSHEETS_ID is required').optional(),
  MONGODB_URI: z.string().min(1, 'A valid MongoDB URI is required').optional(),
});

export const env = envSchema.parse({
  HF_TOKEN: process.env.HF_TOKEN,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
  GOOGLE_SPREADSHEETS_ID: process.env.GOOGLE_SPREADSHEETS_ID,
  MONGODB_URI: process.env.MONGODB_URI,
});
