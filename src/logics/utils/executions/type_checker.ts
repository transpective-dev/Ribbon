import { rib_conf } from "../../manage.ts";
import _interface from "../../templates/interface.ts";
import al from "../../../async_loader.ts"

const { prompt, chalk } = al;
import { colored_prefix } from "../color.ts";
import { assign_slots, type Slot } from "./slot_assigner.ts";

// regex to match <T>, <T: type>, and optional (default)
const SLOT_REGEX = /(<T(?:\s*:\s*\w+)?>(?:\([^)]*\))?)/;

// to match inside content
const SLOT_DETAIL = /^<T(?:\s*:\s*(\w+))?>(?:\(([^)]*)\))?$/;

export const type_checker = async (cmdString: string, userValues: string[]) => {

    // is type exist
    let isValid = true;

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

            const sliced = (() => {
                const matches = Array.from(cmdString.matchAll(new RegExp(SLOT_REGEX, 'g')));
                const target = matches[slot.index];
                if (!target) return '';

                const begin = target.index!;
                const end = begin + target[0].length;
                const expected = 15;

                const start = Math.max(0, begin - expected);
                const finish = Math.min(cmdString.length, end + expected);

                let res = cmdString.slice(start, finish);

                const relBegin = begin - start;
                const relEnd = end - start;
                res = res.slice(0, relBegin) + chalk.red.bold(res.slice(relBegin, relEnd)) + res.slice(relEnd);

                if (start > 0) res = chalk.gray('... ') + res;
                if (finish < cmdString.length) res = res + chalk.gray(' ...');

                return res;
            })()

            const res = await prompt({
                type: 'form',
                name: 'val',
                message: `Missing slot: ${sliced}`,
                choices: [{
                    name: 'val',
                    message: `Please provide value for <T${slot.typeName ? `: ${slot.typeName}` : ''}>`,
                }]
            });
            
            if ('val' in res) {
                assigned.set(slot.index, (res as any).val.val);
            }

        }
    }

    // --- Pass 3: assemble final command ---
    const requiredType = _interface.supported_type;
    const configData = rib_conf.all('config').settings as any;
    const appendDQ = configData.appendDQWhenTString ?? true;

    let i_cmd = '';
    let cursor = 0;

    for (const part of parts) {
        const m = part.match(SLOT_DETAIL);

        // normal text chunk
        if (!m) {
            i_cmd += (i_cmd.length > 0 ? ' ' : '') + part;
            continue;
        }

        // slot chunk
        const slot = slots[cursor++];
        const val = assigned.get(slot!.index) ?? '';
        const typeName = slot!.typeName as typeof requiredType[number];

        // validate type if specified
        if (typeName && requiredType.includes(typeName)) {
            const finalVal = await validateType(val, typeName, requiredType);

            if (finalVal === false) {
                console.log(colored_prefix.error + `invalid value for type ${typeName}`);
                isValid = false;
                break;
            }

            // wrap string values in double quotes if setting enabled
            if (appendDQ && typeName === 'string') {
                i_cmd += ' ' + JSON.stringify(finalVal);
            } else {
                i_cmd += ' ' + finalVal;
            }

        } else if (typeName && !requiredType.includes(typeName)) {
            console.log(colored_prefix.error + `invalid type ${typeName}`);
            isValid = false;
            break;

        } else {
            // untyped <T>
            i_cmd += ' ' + val;
        }
    }

    if (!isValid) return null;

    return i_cmd.trim();
}

// --- Type validator (extracted for clarity) ---

const validateType = async (
    value: string,
    expectedType: string,
    supportedTypes: readonly string[]
): Promise<string | false> => {

    // infer actual type
    let actualType: string = 'string';
    if (['true', 'false'].includes(value.toLowerCase())) {
        actualType = 'boolean';
    } else if (!isNaN(Number(value)) && value.trim() !== '') {
        actualType = 'number';
    }

    // string accepts anything
    if (actualType === expectedType || expectedType === 'string') {
        return value;
    }

    const asking = rib_conf.all('config').settings.asking;

    if (asking.whenTypeNotMatched) {

        const res = await prompt({
            type: 'select',
            name: 'action',
            message: `Type mismatch! Expected [${expectedType}] but got [${actualType}] ('${value}')`,
            choices: [
                { name: 'modify', message: 'Modify' },
                { name: 'ignore', message: 'Ignore' },
            ]
        });

        if ('action' in res) {
            if ((res as any).action === 'ignore') return false;

            if ((res as any).action === 'modify') {
                const newInput = await prompt({
                    type: 'input',
                    name: 'new_val',
                    message: `Enter new ${expectedType} value:`
                });

                if ('new_val' in newInput) {
                    return await validateType((newInput as any).new_val, expectedType, supportedTypes);
                }
            }
        }
    }

    return false;
};