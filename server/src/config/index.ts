import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const configSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid URL" }),
  CLERK_PUBLISHABLE_KEY: z.string().min(1, { message: "CLERK_PUBLISHABLE_KEY is required" }),
  CLERK_SECRET_KEY: z.string().min(1, { message: "CLERK_SECRET_KEY is required" }),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, { message: "CLOUDINARY_CLOUD_NAME is required" }),
  CLOUDINARY_API_KEY: z.string().min(1, { message: "CLOUDINARY_API_KEY is required" }),
  CLOUDINARY_API_SECRET: z.string().min(1, { message: "CLOUDINARY_API_SECRET is required" }),
  RESEND_API_KEY: z.string().min(1, { message: "RESEND_API_KEY is required" }),
  ALGOLIA_APP_ID: z.string().min(1, { message: "ALGOLIA_APP_ID is required" }),
  ALGOLIA_ADMIN_API_KEY: z.string().min(1, { message: "ALGOLIA_ADMIN_API_KEY is required" }),
  ALGOLIA_ADS_INDEX_NAME: z.string().default('fakna_ads'),
  ALGOLIA_USERS_INDEX_NAME: z.string().default('fakna_users'),
});

const parseConfig = () => {
  const result = configSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment configuration:', result.error.format());
    process.exit(1);
  }
  
  return result.data;
};

export const config = parseConfig();
