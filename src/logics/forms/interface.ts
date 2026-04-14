
const search_types = [
  'tag', // search by tag
  'cmd', // search by command
  'desc', // search by description
  'code', // search by code
  'all'
] as const

export default {
  search_types,
}

// types
export type t_search_types = typeof search_types[number]