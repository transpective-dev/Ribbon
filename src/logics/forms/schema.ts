import { z } from "zod";

const command_schema = z.record(
  z.string().min(1, "group name cannot be empty"),
  z.record(
    z.string().min(1, "Command name cannot be empty"),
    z.object({

      // unique-id: format: base32
      id: z.string(),

      // datetime: format: localString
      time: z.string(),

      // acstract
      abs: z.string(),

      desc: z.string().default("No description provided"),
      cmd: z.string().min(1, "Command cannot be empty"),
      tags: z.array(z.string()).default([]),
    })).default({})
).default({
  'system': {},
  'user': {}
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

export type t_config_schema = z.infer<typeof config_schema>
export type t_command_schema = z.infer<typeof command_schema>