import type { t_command_schema, t_config_schema } from './schema.ts'

// filters

/**
 * (?: ) = Non-capturing group.
 * (?:^|\\s) = starts by or preceded by a whitespace
 * \\b = to prevent matching substrings like "rm". garanteeing that only valid whole commands are captured.
 * between \\b-\\b = the commands that you want to capture
 *  */ 

const windows = {
  "delete": {
    "keywords": [
      "(?:^|\\s)\\bdel\\b(?:\\s|$)",
      "(?:^|\\s)\\berase\\b(?:\\s|$)",
      "(?:^|\\s)\\brd\\b(?:\\s|$)",
      "(?:^|\\s)\\brmdir\\b(?:\\s|$)",
      "(?:^|\\s)\\bformat\\b(?:\\s|$)",
      "(?:^|\\s)\\bdiskpart\\b(?:\\s|$)",
      "(?:^|\\s)\\bRemove-Item\\b[\\s\\S]*?\\b-Recurse\\b|(?:^|\\s)\\bRemove-Item\\b[\\s\\S]*?\\b-r\\b(?!\\w)",
      "(?:^|\\s)\\bClear-RecycleBin\\b(?:\\s|$)",
      "(?:^|\\s)\\bRemove-Item\\b(?:\\s|$)",
      "(?:^|\\s)\\brm\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in permanent data loss. Please proceed with caution."
  },
  "shutdown": {
    "keywords": [
      "(?:^|\\s)\\bshutdown\\b[\\s\\S]*\\s[-/][srlhp]\\b",
      "(?:^|\\s)\\bStop-Computer\\b",
      "(?:^|\\s)\\bRestart-Computer\\b"
    ],
    "msg": "DENGER: You are executing a command that may result in system shutdown or restart. Please proceed with caution."
  },
  "registry": {
    "keywords": [
      "(?:^|\\s)\\breg\\b\\s+\\bdelete\\b",
      "(?:^|\\s)\\breg\\b\\s+\\badd\\b",
      "(?:^|\\s)\\bregedit\\b.*?\\b[/-]s\\b",
      "(?:^|\\s)\\bRemove-ItemProperty\\b(?:\\s|$)",
      "(?:^|\\s)\\bSet-ItemProperty\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system registry modification or deletion. Please proceed with caution."
  },
  "clear-logs": {
    "keywords": [
      "(?:^|\\s)\\bwevtutil\\b\\s+\\bcl\\b",
      "(?:^|\\s)\\bClear-EventLog\\b(?:\\s|$)",
      "(?:^|\\s)\\bClear-WinEvent\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system event log clearing. Please proceed with caution."
  },
  "permission": {
    "keywords": [
      "(?:^|\\s)\\btakeown\\b(?:\\s|$)",
      "(?:^|\\s)\\bicacls\\b(?:\\s|$)",
      "(?:^|\\s)\\bcacls\\b(?:\\s|$)",
      "(?:^|\\s)\\bSet-Acl\\b(?:\\s|$)",
      "(?:^|\\s)\\bGet-Acl\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system permission modification or deletion. Please proceed with caution."
  }
}

const darwin = {
  "darwin-delete": {
    "keywords": [
      "(?:^|\\s)\\brm\\s+-(?:\\s|$)",
      "(?:^|\\s)\\brmdir\\b(?:\\s|$)",
      "(?:^|\\s)\\bunlink\\b(?:\\s|$)",
      "(?:^|\\s)\\bsrm\\b(?:\\s|$)",
      "(?:^|\\s)\\brm\\s+-rf\\b(?:\\s|$)",
      "(?:^|\\s)\\brm\\s+-r\\b(?:\\s|$)",
      "(?:^|\\s)\\brm\\s+-f\\b(?:\\s|$)",
      "(?:^|\\s)\\brm\\s+\\*(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in permanent data loss. Please proceed with caution.",
  },
  "darwin-disk": {
    "keywords": [
      "(?:^|\\s)\\bdiskutil\\s+eraseDisk\\b(?:\\s|$)",
      "(?:^|\\s)\\bdiskutil\\s+partitionDisk\\b(?:\\s|$)",
      "(?:^|\\s)\\bdiskutil\\s+zeroDisk\\b(?:\\s|$)",
      "(?:^|\\s)\\bdiskutil\\s+randomDisk\\b(?:\\s|$)",
      "(?:^|\\s)\\bdd\\b(?:\\s|$)",
      "(?:^|\\s)\\bhdiutil\\s+burn\\b(?:\\s|$)",
      "(?:^|\\s)\\bnewfs\\b(?:\\s|$)",
      "(?:^|\\s)\\bmkfs\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system disk erase, partition, or overwrite operation. Please proceed with caution.",
  },
  "darwin-shutdown": {
    "keywords": [
      "(?:^|\\s)\\bshutdown\\s+-h\\b(?:\\s|$)",
      "(?:^|\\s)\\bshutdown\\s+-r\\b(?:\\s|$)",
      "(?:^|\\s)\\bshutdown\\s+-s\\b(?:\\s|$)",
      "(?:^|\\s)\\breboot\\b(?:\\s|$)",
      "(?:^|\\s)\\bhalt\\b(?:\\s|$)",
      "(?:^|\\s)\\bpoweroff\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system shutdown or restart. Please proceed with caution.",
  },
  "darwin-sysctl": {
    "keywords": [
      "(?:^|\\s)\\bsysctl\\s+-w\\b(?:\\s|$)",
      "(?:^|\\s)\\bnvram\\s+-d\\b(?:\\s|$)",
      "(?:^|\\s)\\bnvram\\b(?:\\s|$)",
      "(?:^|\\s)\\bcsrutil\\s+disable\\b(?:\\s|$)",
      "(?:^|\\s)\\bcsrutil\\s+enable\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system core parameter or security setting modification. Please proceed with caution.",
  },
  "darwin-permission": {
    "keywords": [
      "(?:^|\\s)\\bchmod\\s+777\\b(?:\\s|$)",
      "(?:^|\\s)\\bchmod\\s+-R\\b(?:\\s|$)",
      "(?:^|\\s)\\bchown\\b(?:\\s|$)",
      "(?:^|\\s)\\bxattr\\s+-c\\b(?:\\s|$)",
      "(?:^|\\s)\\bsudo\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system permission modification or deletion. Please proceed with caution.",
  }
}

const linux = {
  "linux-delete": {
    "keywords": [
      "(?:^|\\s)\\brm\\s+-(?:\\s|$)",
      "(?:^|\\s)\\brm\\b(?:\\s|$)",
      "(?:^|\\s)\\brmdir\\b(?:\\s|$)",
      "(?:^|\\s)\\bunlink\\b(?:\\s|$)",
      "(?:^|\\s)\\bshred\\b(?:\\s|$)",
      "(?:^|\\s)\\bwipe\\b(?:\\s|$)",
      "(?:^|\\s)\\brm\\s+-rf\\b(?:\\s|$)",
      "(?:^|\\s)\\brm\\s+-r\\b(?:\\s|$)",
      "(?:^|\\s)\\brm\\s+-f\\b(?:\\s|$)",
      "(?:^|\\s)\\brm\\s+--no-preserve-root\\b(?:\\s|$)",
      "(?:^|\\s)\\bfind\\s+-delete\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in permanent data loss. Please proceed with caution.",
  },
  "linux-disk": {
    "keywords": [
      "(?:^|\\s)\\bmkfs\\.\\b(?:\\s|$)",
      "(?:^|\\s)\\bmkfs\\b(?:\\s|$)",
      "(?:^|\\s)\\bmke2fs\\b(?:\\s|$)",
      "(?:^|\\s)\\bfdisk\\b(?:\\s|$)",
      "(?:^|\\s)\\bparted\\b(?:\\s|$)",
      "(?:^|\\s)\\bdd\\b(?:\\s|$)",
      "(?:^|\\s)\\bwipefs\\b(?:\\s|$)",
      "(?:^|\\s)\\bhdparm\\b(?:\\s|$)",
      "(?:^|\\s)\\bblkdiscard\\b(?:\\s|$)",
      "(?:^|\\s)\\bfstrim\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system disk erase, partition, or overwrite operation. Please proceed with caution.",
  },
  "linux-shutdown": {
    "keywords": [
      "(?:^|\\s)\\bshutdown\\s+-h\\b(?:\\s|$)",
      "(?:^|\\s)\\bshutdown\\s+-r\\b(?:\\s|$)",
      "(?:^|\\s)\\bshutdown\\s+-P\\b(?:\\s|$)",
      "(?:^|\\s)\\breboot\\b(?:\\s|$)",
      "(?:^|\\s)\\bhalt\\b(?:\\s|$)",
      "(?:^|\\s)\\bpoweroff\\b(?:\\s|$)",
      "(?:^|\\s)\\bsystemctl\\s+poweroff\\b(?:\\s|$)",
      "(?:^|\\s)\\bsystemctl\\s+reboot\\b(?:\\s|$)",
      "(?:^|\\s)\\bsystemctl\\s+suspend\\b(?:\\s|$)",
      "(?:^|\\s)\\bsystemctl\\s+hibernate\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system shutdown or restart. Please proceed with caution.",
  },
  "linux-root-destroy": {
    "keywords": [
      "(?:^|\\s):\\(\\)\\{\\s+:\\|:&\\s+\\}\\s*;",
      "(?:^|\\s)\\bchmod\\s+-R\\s+777\\s+/",
      "(?:^|\\s)\\bchown\\s+-R\\s+root:root\\s+/",
      "(?:^|\\s)\\brm\\s+-rf\\s+/",
      "(?:^|\\s)\\bdd\\s+of=/dev/",
      "(?:^|\\s)>\\s+/dev/sd",
      "(?:^|\\s)\\becho\\s+c\\s+>\\s+/proc/sysrq-trigger",
      "(?:^|\\s)\\bmkfs\\.\\s+/dev/",
      "(?:^|\\s)\\bfdisk\\s+/dev/"
    ],
    "msg": "DENGER: You are executing a command that may result in system self-destruct. Please proceed with caution.",
  },
  "linux-permission": {
    "keywords": [
      "(?:^|\\s)\\bchmod\\s+777\\b(?:\\s|$)",
      "(?:^|\\s)\\bchmod\\s+-R\\b(?:\\s|$)",
      "(?:^|\\s)\\bchmod\\s+\\+s\\b(?:\\s|$)",
      "(?:^|\\s)\\bchown\\b(?:\\s|$)",
      "(?:^|\\s)\\bchgrp\\b(?:\\s|$)",
      "(?:^|\\s)\\bsudo\\b(?:\\s|$)",
      "(?:^|\\s)\\bsu\\s+-\\b(?:\\s|$)",
      "(?:^|\\s)\\bsetuid\\b(?:\\s|$)",
      "(?:^|\\s)\\bsetgid\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system permission modification or deletion. Please proceed with caution.",
  },
  "linux-network": {
    "keywords": [
      "(?:^|\\s)\\biptables\\s+-F\\b(?:\\s|$)",
      "(?:^|\\s)\\biptables\\s+-X\\b(?:\\s|$)",
      "(?:^|\\s)\\bufw\\s+disable\\b(?:\\s|$)",
      "(?:^|\\s)\\bfirewall-cmd\\s+--stop\\b(?:\\s|$)",
      "(?:^|\\s)\\bip\\s+link\\s+set\\s+down\\b(?:\\s|$)",
      "(?:^|\\s)\\bifconfig\\s+down\\b(?:\\s|$)",
      "(?:^|\\s)\\bnmcli\\s+networking\\s+off\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system network rule modification or network interface disabling. Please proceed with caution.",
  },
  "linux-system-config": {
    "keywords": [
      "(?:^|\\s)/etc/passwd\\b(?:\\s|$)",
      "(?:^|\\s)/etc/shadow\\b(?:\\s|$)",
      "(?:^|\\s)/etc/sudoers\\b(?:\\s|$)",
      "(?:^|\\s)/etc/fstab\\b(?:\\s|$)",
      "(?:^|\\s)/etc/hosts\\b(?:\\s|$)",
      "(?:^|\\s)\\bsysctl\\s+-w\\b(?:\\s|$)",
      "(?:^|\\s)\\bmodprobe\\s+-r\\b(?:\\s|$)",
      "(?:^|\\s)\\brmmod\\b(?:\\s|$)",
      "(?:^|\\s)\\binsmod\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system configuration or kernel module modification. Please proceed with caution.",
  }
}

// system alias

const system_alias: t_command_schema[string] = {
  "rim": {
    id: 'SYS001',
    time: '2026/4/19 10:44:03',
    abs: 're install modules',
    desc: 'delete node modules folder and package-lock.json, then run npm install',
    cmd: 'Remove-Item -r -force node_modules package-lock.json && npm install',
    tags: [],
  }
}


// initialization functions

import Conf from 'conf';

type config_conf = Conf<t_config_schema>

/**
 * single initialization
 * @param store Conf instance
 * @param key config's key ot path (e.g. "a.b.c")
 * @param defaultValue default value
 * @returns whether initialized
 */

export const initIfMissing = <T>(
  store: config_conf,
  key: string,
  defaultValue: T
): boolean => {
  const currentValue = store.get(key);

  if (currentValue === undefined || currentValue === null) {
    store.set(key, defaultValue);
    return true;
  }

  return false;
};

/**
 * batch initialization
 * @param store Conf instance
 * @param defaults default config object
 * @returns initialized keys list
 */

export const initBatch = <T extends Record<string, any>>(
  store: config_conf,
  defaults: T
): string[] => {

  const initialized: string[] = [];

  const traverse = (obj: Record<string, any>, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;

      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        if (initIfMissing(store, fullPath, value)) {
          initialized.push(fullPath);
        }
      }

      else {
        traverse(value, fullPath);
      }
    }
  };

  traverse(defaults);

  return initialized;
};

/**
 * conditional initialization
 * @param store Conf instance
 * @param key config's path
 * @param factory factory function)
 */

export const initConditional = <T>(
  store: config_conf,
  key: string,
  factory: () => T
): void => {
  initIfMissing(store, key, factory());
};

export default {
  windows,
  darwin,
  linux,
  initIfMissing,
  initBatch,
  initConditional
}