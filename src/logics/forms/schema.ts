import type { settings } from "node:cluster";
import { z } from "zod";

const command_schema = z.record(
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
  })
).default({});

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
    askBeforeDelete: z.boolean().default(true)
  }).default({
      alwaysRejectExecution: true,
      askBeforeDelete: true
  })
}).default({
  filter: {},
  settings: {
    alwaysRejectExecution: true,
    askBeforeDelete: true
  }
});

export default {
  command_schema,
  config_schema
}

export type t_config_schema = z.infer<typeof config_schema>
export type t_command_schema = z.infer<typeof command_schema>