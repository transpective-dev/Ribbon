import { rib_conf } from "../../manage.ts";
import _interface from "../../templates/interface.ts";

import chalk from 'chalk'
import { colored_prefix } from "../color.ts";
import { assign_slots, type Slot } from "./slot_assigner.ts";
import { resolve } from "node:dns";
import { error } from "node:console";

// regex to match <T>, <T: type>, and optional (default)
const SLOT_REGEX = /(<T(?:\s*:\s*\w+)?>(?:\([^)]*\))?)/;

// to match inside content
const SLOT_DETAIL = /^<T(?:\s*:\s*(\w+))?>(?:\(([^)]*)\))?$/;

type t_counter =
	{
		value: string,
		expected: string,
		received: string,
		causes: 'type-mismatch' | 'empty' | 'unknown-type' | 'unknown'
	}[]

export const type_checker = async (cmdString: string, userValues: string[]) =>
{

	// store failed 
	const counter: t_counter = [];

	// split command into chunks (text vs slots)
	const parts = cmdString
		.split(SLOT_REGEX)
		.filter(p => p && p.trim() !== '')
		.map(p => p.trim());


	// --- Pass 1: scan all slots ---

	// transiest extends.
	// raw: original placeholder. example: <T: type>(default)， <T>， <T: type>
	// typeName: type name. example: type: [string, number, boolean]

	const slots: (Slot & { raw: string, typeName: string })[] = [];

	// current slot index
	// Using a separate counter to ensure slot indexing ignores non-slot elements.
	let slotIndex = 0;

	// traverse parts 
	for (const part of parts) {

		// find out slot 
		const m = part.match(SLOT_DETAIL);

		// if not slot, then skip
		if (!m) continue;


		slots.push({
			index: slotIndex,
			type: (m[1] || '').trim(), // get type
			defaultVal: m[2] !== undefined ? m[2] : null, // get default value
			raw: part,
			typeName: (m[1] || '').trim()
		});

		slotIndex++;
	}

	// --- Pass 2: distribute values ---
	const values = userValues ? [...userValues] : [];

	// read config to check slot filling feature toggle
	const config_data = rib_conf.all('config').settings as any;
	const enableSlotFilling = config_data.enableSlotFilling ?? true;

	const assigned = assign_slots(slots, values, enableSlotFilling);

	// ask for any slot that has no value and no default
	for (const slot of slots) {

		if (!assigned.has(slot.index) && slot.defaultVal === null) {

			assigned.set(slot.index, null);

		}
	}

	// --- Pass 3: assemble final command ---
	const requiredType = _interface.supported_type;
	const configData = rib_conf.all('config').settings as any;
	const appendDQ = configData.appendDQWhenTString ?? true;

	let i_cmd = '';
	let cursor = 0;

	
	for (const part of parts) {
		
		// slot chunk
		const slot = slots[cursor++];

		// value that user provided
		const val = await new Promise<string>((resolve) =>
		{
			const i = assigned.get(slot!.index)

			if (!i) {
				throw new Error()
			}
			return i

		}).catch(() => '');

		if (!slot) {
			continue;
		}

		// typename
		const typeName = slot.typeName as typeof requiredType[number];

		// push to counter if failed
		const pushFailed = (type: t_counter[0]['causes']) =>
		{
			counter.push({
				value: val,
				expected: typeName,
				received: val,
				causes: type
			})
		}

		const m = part.match(SLOT_DETAIL);

		// normal text chunk
		if (!m) {
			pushFailed("empty")
			i_cmd += (i_cmd.length > 0 ? ' ' : '') + part;
			continue;
		}

		// validate type if specified
		if (typeName && requiredType.includes(typeName)) {

			const finalVal = await validateType(val, typeName, requiredType);

			if (finalVal === false) {
				pushFailed('type-mismatch')
				continue;
			}

			// wrap string values in double quotes if setting enabled
			if (appendDQ && typeName === 'string') {
				i_cmd += ' ' + JSON.stringify(finalVal);
			} else {
				i_cmd += ' ' + finalVal;
			}

		} else if (typeName && !requiredType.includes(typeName)) {
			pushFailed('unknown-type');
			continue;

		} else {
			// untyped <T>
			i_cmd += ' ' + val;
		}
	}

	if (counter.length > 0) {
		logger(counter);
		return null
	};

	return i_cmd.trim();
}

// --- Type validator (extracted for clarity) ---

const validateType = async (
	value: string,
	expectedType: string,
	supportedTypes: readonly string[]
): Promise<string | false> =>
{

	// infer actual type
	let actualType: string = 'string';
	if (['true', 'false'].includes(value.toLowerCase())) {
		actualType = 'boolean';
	} else if (!isNaN(Number(value)) && value.trim() !== '') {
		actualType = 'number';
	}

	// string accepts anything
	if (actualType === expectedType || expectedType === 'string' && supportedTypes.includes(actualType)) {
		return value;
	}

	return false;
};

const logger = (counter: t_counter) =>
{
	counter.forEach((c) =>
	{
		console.log(`Expected type: `, c.expected);
		console.log(`Received: ( ${c.value || '_'} ) [ ${c.received || '_'} ]`);
		console.log(`Due to: ${c.causes}`)
	})

	console.log('')
}