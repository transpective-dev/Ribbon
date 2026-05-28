export const search_types: (keyof CommandObject)[] = [
	'cmd', 
	'desc',
	'id', 
	'time',
	'safeRun'
] as const

export const supported_type = [
	'string',
	'number',
	'boolean',
] as const

export default {
	search_types,
	supported_type
}

export type shellArgs = 'powershell.exe' | '/bin/bash' | undefined

export interface cmd_register
{
	command: string,
	alias?: string[] | string,
	argument?: string[],
	options?: {
		option: string,
		desc?: string
	}[],
	desc?: string,
	action?: (...args: any[]) => void
}

// types
export type t_search_types = typeof search_types[number]

export interface CommandObject
{
	id: string;
	time: string;
	desc: string;
	cmd: string;
	safeRun: boolean;
}

export type CommandGroup = Record<string, CommandObject>;

export type CommandStore = Record<string, CommandGroup>;

export interface audit_log {

	// for sorting
	timestamp: number,
	datetime: string,
	cmd: string,
	reason: string,
	status: {
		safeRun: boolean,
		executed: boolean,
		login: boolean,
	}
	encounted: {
		keywords: {
			[group: string]: string[]
		},
		count: number
	}
}

export interface audit_log_argument {
	cmd?: string,
	safeRun?: boolean,
	executed: boolean,
	reason: string,
	login: boolean,
	encounted: {
		keywords: {
			[group: string]: string[]
		}
	}
}