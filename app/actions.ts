'use server'

import { z } from 'zod'

const briefSchema = z.object({
  name: z.string().trim().min(2, 'Please add your name.'),
  phone: z.string().trim().min(7, 'Please add a phone number.'),
  businessType: z.string().trim().min(1, 'Please choose your business type.'),
  needs: z.string().trim().min(2, 'Tell us what you need.'),
  preferredDate: z.string().trim().min(1, 'Choose a preferred date.'),
  message: z.string().trim().optional(),
  website: z.string().max(0, 'Please leave this field blank.'),
})

export type BriefState = { success: boolean; message?: string; errors?: Record<string, string[]> }

export async function submitBrief(_: BriefState, formData: FormData): Promise<BriefState> {
  const parsed = briefSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors }
  // TODO: Add real email delivery and CRM notification here.
  return { success: true, message: 'Thanks — your brief is in. We will be in touch shortly.' }
}

export const emptyBriefState: BriefState = { success: false }

export { briefSchema }
