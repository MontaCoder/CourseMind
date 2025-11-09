import { z } from 'zod';
import { HTTP_STATUS } from '../config/constants.js';

// Generic Zod-based validation middleware factory
export const validateSchema = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errors = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Attach parsed data for downstream handlers
  req.validated = result.data;
  return next();
};

// Example reusable schemas
export const authSchemas = {
  signup: z.object({
    body: z.object({
      email: z.string().email(),
      mName: z.string().min(2).max(80),
      password: z.string().min(8).max(128),
      type: z.string().optional(),
    }),
  }),
  signin: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8).max(128),
    }),
  }),
};

export const aiSchemas = {
  prompt: z.object({
    body: z.object({
      prompt: z.string().min(1).max(4000),
    }),
  }),
};
