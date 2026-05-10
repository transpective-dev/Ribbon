import z from 'zod'

export const direction = ['r', 'l', 'd', 'u'] as const;

export type t_direction = typeof direction[number];

const suggestion = z.record(
	z.string(),
	z.string()
)

const suggestion_group = z.record(
	z.string(),
	suggestion	
)

export type t_suggestion_group = z.infer<typeof suggestion_group>