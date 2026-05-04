// expose pkg and file for when launch from exe file

import * as manage from './manage.ts'

const glob = globalThis;

glob._rib_manage = manage;