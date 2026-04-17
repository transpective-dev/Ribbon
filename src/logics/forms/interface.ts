
const search_types = [
  'tag', // search by tag
  'cmd', // search by command
  'desc', // search by description
  'code', // search by code
  'all'
] as const

export const supported_type = [
  'string',
  'number',
  'boolean',
] as const

export default {
  search_types,
  supported_type
}

export interface cmd_register {
  command: string,
  alias?: string,
  argument?: string[],
  options?: {
    option: string,
    desc?: string
  }[],
  desc?: string,
  action?: (...args: any[]) => void
}

// types
export type t_search_types = typeof search_types[number]