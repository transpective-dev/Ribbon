import _interface from "../../templates/interface.ts";
import { rib_conf } from "../../manage.ts";
import al from "../../../async_loader.ts"

const { prompt, chalk } = al;
import { colored_prefix } from "../color.ts";

/**
 * Independent Execution Guard  
 * Checks if the final command violates any regex policies
 * 
 * @param cmdString provide command you want to check
 * @returns boolean (true = no keywords found, false = keywords found)
 */

export const execution_guard = async (cmdString: string): Promise<boolean> => {

    const config = rib_conf.all('config') as any;

    const filters = config.filter || {};

    // violations vault
    const detected: { group: string; matched: string[], msg: string }[] = [];

    for (const [groupName, rule] of Object.entries(filters)) {

        // checking the regex patterns setup by user
        const ruleRegex = (rule as any).keywords || [];

        const matched = ruleRegex.filter((r: string) => {
            try {

                // global pattern search
                return new RegExp(r, 'gi').test(cmdString);

            } catch (e) {

                // gracefully ignore ill-formed patterns
                return false;
            }
        });

        if (matched.length > 0) {
            detected.push({
                group: groupName,
                matched: matched,
                msg: (rule as any).msg || `WARNING: We have detected [ ${groupName} ]`
            });
        }
    }

    // Pass safely if no violations
    if (detected.length === 0) return true;

    // Verbose blocking information
    if (config.settings.showMacro) {

        let highlighted = cmdString;

        // highlight all matched regex patterns
        detected.forEach(d => {
            d.matched.forEach(r => {
                try {
                    const regex = new RegExp(`(${r})`, 'g');
                    highlighted = highlighted.replace(regex, chalk.red.bold('$1'));
                } catch (e) { }
            });
        });

        console.log('\n' + '='.repeat(15) + ' Ribbon Execution Guard ' + '='.repeat(15));
        console.log('\ncommand: ' + highlighted);
        console.log('\ngroups: ');

        detected.forEach((item) => {
            console.log(`- ${item.group}: ${item.matched.join(', ')}`);
        });

        const displayMsg = () => {

            if (detected.length === 1 && detected[0] !== undefined) {
                return detected[0].msg;
            }

            if (detected.length > 1) {
                return `DANGER: We have detected [ ${detected.map(d => d.group).join(', ')} ]`;
            }

            return '';

        }

        console.log('\lmessage: ' + displayMsg() + '\n\n' + "=".repeat(56) + '\n');
    }

    // Auto-Reject check
    if (config.settings.alwaysRejectExecution) {
        console.log(colored_prefix.error + 'Execution Cancelled: alwaysRejectExecution is enabled.');
        return false;
    }

    // Explicit continuation prompt
    const confirm = await prompt({
        type: 'select',
        name: 'val',
        message: 'Violations detected. Are you sure you want to continue?',
        choices: ['yes', 'no']
    });

    if ('val' in confirm && (confirm as any).val === 'no') {
        console.log('Execution Cancelled by Ribbon-Execution-Guard');
        return false;
    }

    return true;
};