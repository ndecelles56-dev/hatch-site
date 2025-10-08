import { config } from 'dotenv';

config();

export const getEnv = (key: string, fallback?: string) => {
  const value = process.env[key];
  if (!value && typeof fallback === 'undefined') {
    throw new Error(`Missing environment variable ${key}`);
  }
  return value ?? fallback ?? '';
};

export const getNumberEnv = (key: string, fallback?: number) => {
  const value = process.env[key];
  if (!value) {
    if (typeof fallback === 'number') return fallback;
    throw new Error(`Missing environment variable ${key}`);
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
};
