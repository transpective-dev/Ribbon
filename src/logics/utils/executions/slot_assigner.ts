/**
 * Slot Assigner
 * 
 * Intelligently distributes user-provided values across <T> slots,
 * prioritizing slots WITHOUT defaults before overwriting those WITH defaults.
 */

export interface Slot {
    index: number;         // original position in the command
    type: string;          // e.g. 'string', 'number', 'boolean', or '' (untyped)
    defaultVal: string | null;  // null = no default
}

/**
 * Assigns values to slots with smart priority preserving argument order:
 * 
 * 1. Gather the required number of target slots:
 *    - Always prioritize plain slots (no default).
 *    - If user provides more values than plain slots, consume the EARLIEST default slots.
 * 2. Sort the target slots by original index.
 * 3. Map user values strictly left-to-right to the sorted target slots.
 * 4. Fill unselected default slots with their defaults.
 */
export const assign_slots = (slots: Slot[], values: string[], enableSlotFilling: boolean): Map<number, string> => {

    const result = new Map<number, string>();

    // Fallback or full-override: direct sequential assignment
    if (!enableSlotFilling || values.length >= slots.length) {
        
        // Sequentially assign values within the provided range.
        slots.forEach((s, i) => {
            if (i < values.length) {
                result.set(s.index, values[i]!);
            }
        });
        
        // Fill unselected default slots with their defaults
        slots.forEach(s => {
            if (!result.has(s.index) && s.defaultVal !== null) {
                result.set(s.index, s.defaultVal!);
            }
        });
        
        return result;
    }

    const plains = slots.filter(s => s.defaultVal === null);
    const defaults = slots.filter(s => s.defaultVal !== null);

    let targetSlots: Slot[] = [];

    // Select slots to receive values
    if (values.length <= plains.length) {
        
        // Not enough values: just fill the first available plain slots
        targetSlots = plains.slice(0, values.length);
        
    } else {
        
        // Enough values to fill all plains, and some earliest defaults
        targetSlots = [...plains];
        const overflow = values.length - plains.length;
        targetSlots.push(...defaults.slice(0, overflow));
        
    }

    // Resequence back to original left-to-right order
    targetSlots.sort((a, b) => a.index - b.index);

    // Map ordered values to ordered slots
    targetSlots.forEach((s, i) => {
        result.set(s.index, values[i]!);
    });

    // Unselected default slots keep their original defaults
    defaults.forEach(s => {
        if (!result.has(s.index)) {
            result.set(s.index, s.defaultVal!);
        }
    });

    return result;
};
