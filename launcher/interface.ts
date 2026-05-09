export const direction = ['r', 'l', 'd', 'u'] as const;

export type t_direction = typeof direction[number];