import { z } from 'zod';
export const submissionSchema = z.object({
  kind: z.enum(['issue','request','outcome','search','no_result','billing','outbound']),
  service_id: z.string().max(100).optional(),
  message: z.string().trim().max(2000).default(''),
  outcome: z.enum(['yes','no','unsure']).optional(),
  billing: z.enum(['direct','apple','google','partner','paypal']).optional(),
  website: z.string().max(0).optional(),
}).superRefine((s, ctx) => {
  if (['issue','request'].includes(s.kind) && s.message.length < 5) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please add at least five characters.', path: ['message'] });
  if (s.kind === 'outcome' && !s.outcome) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Choose an outcome.', path: ['outcome'] });
});
export type Submission = z.input<typeof submissionSchema>;
