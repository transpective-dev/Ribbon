import { z } from 'zod'

const command_schema = z.record(
	z.string(),
	z.object({

		// unique-id: format: base32
		id: z.string(),

		// datetime: format: localString
		time: z.string(),

		desc: z.string().default("No description provided"),
		cmd: z.string(),
		safeRun: z.boolean().default(false),
	})
).default({})

const config_schema = z.object({
	filter: z.record(
		z.string().default('unclassified'),
		z.object({
			keywords: z.array(z.string()).default([]),
			msg: z.string().default(''),
		})
	).default({}),
	settings: z.object({
		showMacro: z.boolean().default(true),

		// append double quotes when using <T: string>
		appendDQWhenTString: z.boolean().default(true),

		/**
		 * when enabled, plain slot has higher priority than default slot.
		 * it means, plain slot will be filled first, then default slot will be filled in order.
		 * 
		 * for example: [a, B, c, D, e]
		 * 
		 * lowercase: plain slot
		 * uppercase: default slot
		 * 
		 * - when 2 argument provided: fill [a, c]
		 * - when 3 argument provided: fill [a, c, e]
		 * - when 4 argument provided: fill [a, B, c, e]
		 * - when 5 argument provided: fill [a, B, c, e, D]
		 * 
		 */
		enableSlotFilling: z.boolean().default(true),

		// true:  Use PowerShell (supports advanced scripts like 'throw')
		// false: Use standard CMD (default system shell)
		useShell: z.boolean().default(false),

		// enable: change shell state by execute test command
		// diable: use `useShell` to decide shell type
		smartShell: z.boolean().default(false),

		// true: needs token and safeRun two conditions
		// false: token is not required, but safeRun is still required.
		rigid: z.boolean().default(false),

		// enable: safeRun state will be based on result of execution-guard.
		// disable: always false
		safeRunAutoChange: z.boolean().default(false),

	}).default({
		showMacro: true,
		appendDQWhenTString: true,
		enableSlotFilling: true,
		useShell: false,
		smartShell: false,
		rigid: false,
		safeRunAutoChange: false,
	}).default({
		showMacro: true,
		appendDQWhenTString: true,
		enableSlotFilling: true,
		useShell: false,
		smartShell: true,
		rigid: false,
		safeRunAutoChange: false,
	})
});

export default {
	command_schema,
	config_schema
}

export type t_config_schema = z.infer<typeof config_schema>
export type t_command_schema = z.infer<typeof command_schema>
