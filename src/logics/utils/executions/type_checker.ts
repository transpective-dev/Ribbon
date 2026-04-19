import { rib_conf } from "../../manage.ts";
import _interface from "../../forms/interface.ts";
import enquirer from "enquirer";
const { prompt } = enquirer;
import { colored_prefix } from "../color.ts";

export const type_checker = async (cmdString: string, type: string[]) => {

    // Validate type; abort if no match found.
    let isValid = true;

    // aggregate command here
    let i_cmd = '';

    // split command for type mapping
    const parts = (cmdString.split(/(<T(?:\s*:\s*\w+)?>(?:\([^\\n]*\))?)/) as string[]).filter((item) => {

        if (item === undefined || item === null || item === '' || item.trim() === '') {
            return false;
        }

        return true;
    }).map((item) => {
        return item.trim();
    });

    const isAsk = (() => {

        const i = rib_conf.all('config').settings.asking;

        const to: {
            typeMissing?: boolean,
            typeNotMatched?: boolean
        } = {
        }

        if ('whenTypeMissing' in i) {
            to.typeMissing = true;
        }

        if ('whenTypeNotMatched' in i) {
            to.typeNotMatched = true;
        }

        return to;
    })();

    const requiredType = _interface.supported_type;

    const validateType = async (value: string, type: string): Promise<string | false> => {

        let valType: typeof requiredType[number] | 'unknown' = 'unknown';

        if (['true', 'false'].includes(value.toLowerCase())) {
            valType = 'boolean';
        } else if (!isNaN(Number(value)) && value.trim() !== '') {
            valType = 'number';
        } else {
            valType = 'string';
        }

        // string can broadly accept numbers/booleans as text, but based on strict typing for others
        if (valType === type || type === 'string') {
            return value;
        }

        if (isAsk.typeNotMatched) {

            const res = await prompt({
                type: 'select',
                name: 'action',
                message: `Type mismatch! Expected [${type}] but got [${valType}] ('${value}')`,
                choices: [
                    { name: 'modify', message: 'Modify' },
                    { name: 'ignore', message: 'Ignore' },
                ]
            });

            if ('action' in res) {
                if ((res as any)['action'] === 'ignore') {
                    return false;
                }

                if ((res as any)['action'] === 'modify') {
                    const newInput = await prompt({
                        type: 'input',
                        name: 'new_val',
                        message: `Enter new ${type} value:`
                    });

                    if ('new_val' in newInput) {
                        // Recursively call for the newly provided value
                        return await validateType((newInput as any)['new_val'], type);
                    }
                }
            }

            return false;
        }

        return false;
    };

    for (let item of parts) {

        // handle type missing 
        const askForType = async () => {
            const res = await prompt({
                type: 'input',
                name: 'missing type',
                message: `missing parameter for ${item}, please input: `
            });

            if ('missing type' in res) {
                return (res as any)['missing type'];
            }
            return '';
        }

        // check type existence
        const checkExistence = async () => {

            
            if (type === undefined || type.length === 0) {

                if (item.match(/(\([^\\n]*\))/)) {
    
                    const match = item.match(/\(([^\\n]*)\)/);
    
                    return match?.[1];
                }
                
                return await askForType();

            }
            
            return type.shift()?.trim();
        }

        if (item.match(/<T:\s?\w*>/)) {

            const match = item.match(/<T:\s*(\w*)>/);

            const type = (match ? match[1] : '')?.trim() as typeof requiredType[number];

            const val = await checkExistence();

            if (!requiredType.includes(type)) {

                console.log(colored_prefix.error + `invalid type ${type}`);

                isValid = false;

                break;

            }

            const finalVal = await validateType(val, type);

            if (finalVal !== false) {

                const configData = rib_conf.all('config').settings as any;

                if ("appendDQWhenTString" in configData && configData.appendDQWhenTString && type === 'string') {
                    i_cmd += ' ' + JSON.stringify(finalVal);
                } else {
                    i_cmd += ' ' + finalVal;
                }

            } else {
                console.log(colored_prefix.error + `invalid value for type ${type}`);
                isValid = false;
                break;
            }

            continue;
        }

        if (item === '<T>') {
            const val = await checkExistence();
            i_cmd += ' ' + val;
            continue;
        }

        // Normal command chunk
        i_cmd += (i_cmd.length > 0 ? ' ' : '') + item;

    }

    return i_cmd;

}