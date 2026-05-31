export const editType = ["config", "macro"];

import { z } from 'zod'

export const cache = z.object({

	// default for if application name provided
	default: z.string().nullable().default(null),

	// sudo login expiry time. 
	expiry_time: z.number().nullable().default(null),

}).default({
	default: null,
	expiry_time: null
})

export type Cache = z.infer<typeof cache>;