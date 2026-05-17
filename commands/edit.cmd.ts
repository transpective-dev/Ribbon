import type { cmd_register } from "../src/logics/templates/interface.ts";

export default {
	command: 'edit',
	argument: [
		'<name>'
	],
	desc: 'Edit a command',
	action: async (name: string) =>
	{
		
	}
} satisfies cmd_register

