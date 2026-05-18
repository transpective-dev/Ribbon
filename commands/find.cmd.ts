import type { t_command_schema } from "../src/logics/templates/schema.ts";
import { pallete } from "../src/logics/utils/color.ts";

const { rib_conf } = globalThis._rib_manage
import chalk from 'chalk'
const { utils } = globalThis._rib_utils
const { search_types, cmd_register } = globalThis._rib_types

export default {
    command: 'find',
    desc: 'find commands',
    argument: ['[value]'],
    options: [
        { option: '-t, --type <value>', desc: 'Type of search' },
    ],
    action: (value: any, options: any) => {

        const searchTypes = search_types;

        if (!options.type || !searchTypes.includes(options.type)) {
            options.type = 'all';
        }

        const res: t_command_schema = rib_conf.find({
            type: options.type,
            keywords: value,
        });

        if ((Object.keys(res)).length <= 0) {
            return console.log('No macros found');
        }

        formatter(res)

    }
} satisfies typeof cmd_register

const formatter = (res: t_command_schema) => {

	console.log('\n')
	
	const getPad = (i: t_command_schema[string]) => {
		
		return {
			keyLength: Object.keys(i).reduce((max, key) => {
				return Math.max(max, key.length)
			}, 0) + 2,
		}
	}
	
	Object.entries(res).forEach(([key, value]) => {

		const {columns} = process.stdout
		
		console.log('##', key)
		console.log('-'.repeat(13))

		const { keyLength } = getPad(value)

		Object.entries(value).forEach(([child_key, child_value]) => {

			const log = (child_key.padEnd(keyLength) + chalk.hex(pallete.grey_4)(": ") + child_value) as string

			if (log.length > columns) {

				let left = log

				const arr: string[] = []

				const maxValueLength = columns - keyLength

				while (left.length > maxValueLength) {

					if (arr.length === 0) {

						const sliced = left.slice(0, columns)
						arr.push(sliced)
						left = left.slice(columns)

						continue

					}

					const sliced = left.slice(0, maxValueLength - 2)
					arr.push(' '.repeat(keyLength) + chalk.hex(pallete.grey_6)("| ") + sliced)
					left = left.slice(maxValueLength - 2)
					
				}

				arr.push(' '.repeat(keyLength) + chalk.hex(pallete.grey_6)("| ") + left)

				arr.forEach((item) => {
					console.log(item)
				})

			} else {
				console.log(log)
			}
			
		})
		console.log('\n')
	})

	console.log('')
}
