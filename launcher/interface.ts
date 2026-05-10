import z from 'zod'

export const direction = ['r', 'l', 'd', 'u'] as const;

export type t_direction = typeof direction[number];

export const suggestion = z.array(
	z.object({
		name: z.string(),
		cmd: z.string(),
		point: z.number(),
	})
)

export const suggestion_group = z.record(
	z.string(),
	suggestion	
)

export type t_suggestion_group = z.infer<typeof suggestion_group>

export type t_suggestion = z.infer<typeof suggestion>