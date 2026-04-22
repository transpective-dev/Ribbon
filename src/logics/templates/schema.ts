import al from "../../async_loader.ts";
import { system_init } from "./command_init.ts";

const { z } = al;

const command_schema = z.record(
  z.string().min(1, "group name cannot be empty"),
  z.record(
    z.string(),
    z.object({

      // unique-id: format: base32
      id: z.string(),

      // datetime: format: localString
      time: z.string(),

      // acstract
      abs: z.string(),

      desc: z.string().default("No description provided"),
      cmd: z.string(),
      tags: z.array(z.string()).default([]),
    })).default({})
).default({
})

const config_schema = z.object({
  filter: z.record(
    z.string().default('unclassified'),
    z.object({
      keywords: z.array(z.string()).default([]),
      msg: z.string().default(''),
    })
  ).default({}),
  settings: z.object({
    alwaysRejectExecution: z.boolean().default(true),
    askBeforeDelete: z.boolean().default(true),
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

    asking: z.object({
      whenTypeMissing: z.boolean().default(true),
      whenTypeNotMatched: z.boolean().default(true),
    }).default({
      whenTypeMissing: true,
      whenTypeNotMatched: true
    })

  }).default({
    alwaysRejectExecution: true,
    askBeforeDelete: true,
    showMacro: true,
    appendDQWhenTString: true,
    enableSlotFilling: true,
    useShell: false,
    asking: {
      whenTypeMissing: true,
      whenTypeNotMatched: true
    }
  })
}).default({
  filter: {},
  settings: {
    alwaysRejectExecution: true,
    askBeforeDelete: true,
    showMacro: true,
    appendDQWhenTString: true,
    enableSlotFilling: true,
    useShell: false,
    asking: {
      whenTypeMissing: true,
      whenTypeNotMatched: true
    }
  }
});

export default {
  command_schema,
  config_schema
}

// @ts-ignore
export type t_config_schema = z.infer<typeof config_schema>
// @ts-ignore
export type t_command_schema = z.infer<typeof command_schema>